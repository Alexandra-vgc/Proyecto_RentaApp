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

const ensureClientData = async (email, nombreCompleto, tipo_cliente) => {
  if (!email) throw new Error("Email necesario");
  const rolAsignado = tipo_cliente === 'comprador' ? 'comprador' : 'inquilino';
  let userRes = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
  
  let usuarioId;
  let isNewUser = false; // 🧠 AQUÍ SABEMOS SI ES NUEVO O YA EXISTÍA

  if (userRes.rows.length > 0) {
    usuarioId = userRes.rows[0].id;
    // Si ya existe, le subimos el rango pero NO tocamos su contraseña
    await pool.query('UPDATE usuarios SET rol = $1 WHERE id = $2', [rolAsignado, usuarioId]);
  } else {
    // Solo si el Admin lo crea manualmente desde cero, le damos contraseña temporal
    const hashed = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    const newUser = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id',
      [nombreCompleto, email, hashed, rolAsignado]
    );
    usuarioId = newUser.rows[0].id;
    isNewUser = true; 
  }

  const partes = (nombreCompleto || 'Nuevo').split(' ');
  const nombre = partes[0];
  const apellido = partes.slice(1).join(' ') || '.';
  const cedulaUnica = `TEMP-${usuarioId}`;
  let clienteId = null;

  if (rolAsignado === 'inquilino') {
    const inqRes = await pool.query('SELECT id FROM inquilinos WHERE email = $1', [email]);
    if (inqRes.rows.length === 0) {
      await pool.query(
        `INSERT INTO inquilinos (id, nombre, apellido, cedula, email, telefono, estado) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [usuarioId, nombre, apellido, cedulaUnica, email, '0900000000', 'activo']
      );
      clienteId = usuarioId;
    } else {
      clienteId = inqRes.rows[0].id;
    }
  } else {
    const compRes = await pool.query('SELECT id FROM compradores WHERE email = $1', [email]);
    if (compRes.rows.length === 0) {
      await pool.query(
        `INSERT INTO compradores (id, nombre, apellido, cedula, email, telefono) VALUES ($1, $2, $3, $4, $5, $6)`,
        [usuarioId, nombre, apellido, cedulaUnica, email, '0900000000']
      );
      clienteId = usuarioId;
    } else {
      clienteId = compRes.rows[0].id;
    }
  }
  
  return { clienteId, isNewUser };
};

export const crear = async (req, res) => {
  try {
    const { solicitud_id, fecha_inicio, fecha_fin, canon, tipo_cliente } = req.body; 
    if (!tipo_cliente) return res.status(400).json({ error: "Debe especificar si es inquilino o comprador." });

    const solRes = await pool.query('SELECT propiedad_id, correo_cliente, nombre_cliente FROM solicitudes_arriendo WHERE id = $1', [solicitud_id]);
    if (solRes.rows.length === 0) return res.status(404).json({ error: "Solicitud no encontrada." });

    const { propiedad_id, correo_cliente, nombre_cliente } = solRes.rows[0];
    
    // Obtenemos si es nuevo o no
    const { clienteId: idLegal, isNewUser } = await ensureClientData(correo_cliente, nombre_cliente, tipo_cliente);
    const columnaId = tipo_cliente === 'comprador' ? 'comprador_id' : 'inquilino_id';

    const result = await pool.query(
      `INSERT INTO contratos (solicitud_id, propiedad_id, ${columnaId}, fecha_inicio, fecha_fin, monto_mensual, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [solicitud_id, propiedad_id, idLegal, fecha_inicio, fecha_fin, canon || 0, 'activo']
    );

    // ✅ MAGIA DE BLOQUEO: Ocupamos la propiedad automáticamente en la base de datos
    await pool.query(
      `UPDATE propiedades SET estado = 'ocupado' WHERE id = $1`,
      [propiedad_id]
    );

    const esComprador = tipo_cliente === 'comprador';
    const tituloModo = esComprador ? "Contrato de Compraventa" : "Contrato de Arrendamiento";
    
    // ✅ MAGIA DEL CORREO: Texto dinámico dependiendo de si ya estaba registrado
    const textoPassword = isNewUser 
      ? `<p style="margin: 5px 0;"><b>Contraseña Temporal:</b> <span style="color: #C66A3D; font-weight: bold;">${DEFAULT_PASSWORD}</span></p>
         <p style="margin: 10px 0 0 0; color: #d32f2f; font-size: 13px;">* Te recomendamos cambiar esta clave al iniciar sesión.</p>`
      : `<p style="margin: 5px 0;"><b>Contraseña:</b> <span style="color: #4E5B3C; font-weight: bold;">Usa tu clave personal (la que creaste al registrarte en la app).</span></p>`;

    sendMail({
      to: correo_cliente,
      subject: `🔑 ¡Felicidades! Tu ${tituloModo} está listo`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #4E5B3C; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">MiRentaApp</h1>
          </div>
          <div style="padding: 30px; background-color: #ffffff;">
            <h2 style="color: #C66A3D; margin-top: 0;">${tituloModo}</h2>
            <p style="color: #555; font-size: 16px;">Hola <b>${nombre_cliente}</b>, ¡Bienvenido a tu nuevo hogar!</p>
            <p style="color: #555; font-size: 16px;">Tu contrato ha sido aprobado y generado con éxito. Tu perfil ha sido actualizado a <b>${tipo_cliente.toUpperCase()}</b>.</p>
            
            <div style="background-color: #F5EFE6; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 5px solid #C66A3D;">
              <p style="margin: 0; color: #4E5B3C;"><strong>Tus credenciales de acceso:</strong></p>
              <hr style="border: 0; border-top: 1px solid #BFA58A; margin: 10px 0;">
              <p style="margin: 5px 0;"><b>Usuario:</b> ${correo_cliente}</p>
              ${textoPassword}
            </div>

            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
              <p style="margin: 0; color: #555; font-size: 14px; text-align: center;">
                Ingresa a tu nuevo panel para gestionar tus pagos, revisar tu contrato y comunicarte con administración.
              </p>
            </div>
          </div>
        </div>
      `
    }).then(() => console.log(`✅ Correo enviado a: ${correo_cliente}`))
      .catch((e) => console.log(`⚠️ El contrato se guardó, pero hubo error al enviar correo: ${e.message}`));

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error en crear contrato:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

export const listar = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.fecha_inicio, c.fecha_fin, c.monto_mensual AS canon, c.estado, s.nombre_cliente, p.sector AS nombre_propiedad
      FROM contratos c LEFT JOIN solicitudes_arriendo s ON c.solicitud_id = s.id LEFT JOIN propiedades p ON c.propiedad_id = p.id
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
    await pool.query(`UPDATE contratos SET fecha_inicio=$1, fecha_fin=$2, monto_mensual=$3, estado=$4 WHERE id=$5`, [fecha_inicio, fecha_fin, canon, estado, id]);
    res.json({ message: 'Actualizado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar' });
  }
};