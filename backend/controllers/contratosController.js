import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { sendMail } from '../utils/mailer.js';

dotenv.config();
const { Pool } = pg;
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const DEFAULT_PASSWORD = process.env.DEFAULT_USER_PASSWORD || 'MiRenta2026';

/**
 * Registra al cliente en la tabla 'inquilinos' y 'usuarios' 
 * asegurando que los IDs estén sincronizados.
 */
const ensureInquilinoData = async (email, nombreCompleto, tipo_cliente) => {
  if (!email) throw new Error("Email necesario");
  
  // 1. Definimos el rol basado en el botón que presionó el Admin
  // Si tipo_cliente es 'comprador', el rol será 'comprador', sino 'inquilino'
  const rolAsignado = tipo_cliente === 'comprador' ? 'comprador' : 'inquilino';
  
  let userRes = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
  let usuarioId;

  if (userRes.rows.length > 0) {
    usuarioId = userRes.rows[0].id;
    // Opcional: Actualizamos el rol por si el usuario ya existía con otro perfil
    await pool.query('UPDATE usuarios SET rol = $1 WHERE id = $2', [rolAsignado, usuarioId]);
  } else {
    // Si el usuario no existe, lo creamos con la contraseña encriptada
    const hashed = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    const newUser = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id',
      [nombreCompleto, email, hashed, rolAsignado] // ✅ Se guarda el rol dinámico
    );
    usuarioId = newUser.rows[0].id;
  }

  // 2. Verificamos la tabla 'inquilinos' para que los IDs coincidan
  const inquilinoRes = await pool.query('SELECT id FROM inquilinos WHERE email = $1', [email]);
  
  if (inquilinoRes.rows.length === 0) {
    const partes = (nombreCompleto || 'Nuevo').split(' ');
    const nombre = partes[0];
    const apellido = partes.slice(1).join(' ') || '.';
    const cedulaUnica = `TEMP-${usuarioId}`;

    await pool.query(
      `INSERT INTO inquilinos (id, nombre, apellido, cedula, email, telefono, estado) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [usuarioId, nombre, apellido, cedulaUnica, email, '0900000000', 'activo']
    );
  } else {
    usuarioId = inquilinoRes.rows[0].id;
  }

  return usuarioId;
};

export const crear = async (req, res) => {
  try {
    const { solicitud_id, fecha_inicio, fecha_fin, canon, tipo_cliente } = req.body; 
    
    // 1. Validación de seguridad para el tipo de cliente
    if (!tipo_cliente) {
      return res.status(400).json({ error: "Debe especificar si es inquilino o comprador." });
    }

    // 2. Buscamos los datos de la solicitud original
    const solRes = await pool.query(
      'SELECT propiedad_id, correo_cliente, nombre_cliente FROM solicitudes_arriendo WHERE id = $1',
      [solicitud_id]
    );

    if (solRes.rows.length === 0) {
      return res.status(404).json({ error: "Solicitud no encontrada." });
    }

    const { propiedad_id, correo_cliente, nombre_cliente } = solRes.rows[0];

    // 3. Sincronizamos con el ID legal y asignamos el ROL (inquilino o comprador)
    // Pasamos tipo_cliente a la función que modificamos antes
    const idLegal = await ensureInquilinoData(correo_cliente, nombre_cliente, tipo_cliente);

    // 4. Guardamos el contrato en la base de datos
    const result = await pool.query(
      `INSERT INTO contratos (solicitud_id, propiedad_id, inquilino_id, fecha_inicio, fecha_fin, monto_mensual, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [solicitud_id, propiedad_id, idLegal, fecha_inicio, fecha_fin, canon || 0, 'activo']
    );

    // 5. PERSONALIZACIÓN DEL CORREO SEGÚN EL ROL
    const esComprador = tipo_cliente === 'comprador';
    const tituloModo = esComprador ? "Contrato de Compraventa" : "Contrato de Arrendamiento";
    const mensajeBienvenida = esComprador 
      ? "¡Felicidades por tu nueva adquisición! El proceso de compra de tu inmueble ha sido registrado exitosamente en nuestra Notaría Digital."
      : "¡Bienvenido a tu nuevo hogar! Tu contrato de arrendamiento ha sido generado y ya puedes gestionar tus pagos desde tu panel.";

    // 6. Envío de correo electrónico con botón estilizado
    try {
      await sendMail({
        to: correo_cliente,
        subject: `🔑 Credenciales de Acceso - ${tituloModo}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <div style="background-color: #4E5B3C; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">MiRentaApp</h1>
            </div>
            <div style="padding: 30px; background-color: #ffffff;">
              <h2 style="color: #C66A3D; margin-top: 0;">${tituloModo}</h2>
              <p style="color: #555; font-size: 16px; line-height: 1.5;">Hola <b>${nombre_cliente}</b>,</p>
              <p style="color: #555; font-size: 16px; line-height: 1.5;">${mensajeBienvenida}</p>
              
              <div style="background-color: #F5EFE6; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 5px solid #C66A3D;">
                <p style="margin: 0; color: #4E5B3C;"><strong>Tus credenciales de acceso:</strong></p>
                <hr style="border: 0; border-top: 1px solid #BFA58A; margin: 10px 0;">
                <p style="margin: 5px 0;"><b>Usuario:</b> ${correo_cliente}</p>
                <p style="margin: 5px 0;"><b>Contraseña:</b> <span style="color: #C66A3D; font-weight: bold;">${DEFAULT_PASSWORD}</span></p>
                <p style="margin: 5px 0;"><b>Perfil:</b> <span style="text-transform: uppercase;">${tipo_cliente}</span></p>
              </div>

              <div style="text-align: center; margin: 35px 0;">
                <a href="http://localhost:5173/login" 
                   style="background-color: #C66A3D; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(198, 106, 61, 0.2);">
                   Ir a iniciar sesión
                </a>
              </div>
              
              <p style="color: #888; font-size: 13px; text-align: center;">
                Si no solicitaste este acceso, por favor contacta con soporte técnico.
              </p>
            </div>
            <div style="background-color: #f8f8f8; padding: 15px; text-align: center; font-size: 12px; color: #999;">
              © 2026 MiRentaApp - Quito, Ecuador
            </div>
          </div>
        `
      });
      console.log(`✅ Correo de ${tipo_cliente} enviado a: ${correo_cliente}`);
    } catch (mailError) {
      console.error("⚠️ Error enviando correo:", mailError.message);
      // No devolvemos error 500 para que el contrato sí se guarde aunque el mail falle
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error en crear contrato:", error.message);
    res.status(500).json({ error: error.message });
  }
};
// --- AQUÍ EMPIEZAN LAS FUNCIONES QUE DABAN EL ERROR ---

export const listar = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.fecha_inicio, c.fecha_fin, c.monto_mensual AS canon, c.estado,
             s.nombre_cliente, p.sector AS nombre_propiedad
      FROM contratos c
      LEFT JOIN solicitudes_arriendo s ON c.solicitud_id = s.id
      LEFT JOIN propiedades p ON c.propiedad_id = p.id
      ORDER BY c.id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar' });
  }
};

export const actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha_inicio, fecha_fin, canon, estado } = req.body;
    await pool.query(
      `UPDATE contratos SET fecha_inicio=$1, fecha_fin=$2, monto_mensual=$3, estado=$4 WHERE id=$5`,
      [fecha_inicio, fecha_fin, canon, estado, id]
    );
    res.json({ message: 'Actualizado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar' });
  }
};