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

// Contraseña por defecto si no hay una en el .env
const DEFAULT_PASSWORD = process.env.DEFAULT_USER_PASSWORD || 'MiRenta2026';

/**
 * Función para asegurar que el invitado tenga una cuenta de usuario
 * para poder iniciar sesión y ver su contrato.
 */
const ensureInquilinoUser = async (email, nombre) => {
  if (!email) return null;
  
  // Verificamos si ya existe el usuario
  const existing = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  // Si no existe, lo creamos con el rol 'inquilino'
  const hashed = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const result = await pool.query(
    'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING *',
    [nombre || email, email, hashed, 'inquilino']
  );
  return result.rows[0];
};

// ✅ CREAR CONTRATO Y ENVIAR CREDENCIALES
export const crear = async (req, res) => {
  try {
    const { solicitud_id, fecha_inicio, fecha_fin, canon } = req.body;

    // 1. Buscamos la propiedad conectada a esta solicitud
    const solRes = await pool.query(
        'SELECT propiedad_id, correo_cliente, nombre_cliente FROM solicitudes_arriendo WHERE id = $1', 
        [solicitud_id]
    );
    
    if (solRes.rows.length === 0) {
        return res.status(404).json({ error: 'No se encontró la solicitud base.' });
    }

    const solInfo = solRes.rows[0];
    const propiedad_id = solInfo.propiedad_id;

    // 2. Insertamos el contrato en la base de datos
    const result = await pool.query(
      `INSERT INTO contratos 
      (solicitud_id, propiedad_id, fecha_inicio, fecha_fin, monto_mensual, estado)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [solicitud_id, propiedad_id, fecha_inicio, fecha_fin, canon || 0, 'activo']
    );

    const contrato = result.rows[0];

    // 3. LOGICA DE ENVÍO DE CREDENCIALES (SEGUNDO CORREO)
    if (solInfo.correo_cliente) {
      // Aseguramos que el invitado tenga cuenta en la tabla 'usuarios'
      await ensureInquilinoUser(solInfo.correo_cliente, solInfo.nombre_cliente);

      const loginUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      
      const subject = "🔑 Tus Credenciales de Acceso - MiRentaAPP";
      const html = `
        <div style="font-family: sans-serif; border: 1px solid #C66A3D; padding: 20px; border-radius: 10px;">
            <h2 style="color: #4E5B3C;">¡Bienvenido/a, ${solInfo.nombre_cliente}!</h2>
            <p>Se ha generado tu <b>Contrato Digital</b> con éxito para el inmueble #${propiedad_id}.</p>
            <p>Usa los siguientes datos para ingresar al sistema y revisar tu documento:</p>
            
            <div style="background-color: #F5EFE6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 5px 0;"><b>Usuario (Correo):</b> ${solInfo.correo_cliente}</p>
                <p style="margin: 5px 0;"><b>Contraseña Temporal:</b> <span style="color: #C66A3D; font-weight: bold;">${DEFAULT_PASSWORD}</span></p>
            </div>

            <p>Haz clic en el botón de abajo para iniciar sesión:</p>
            <a href="${loginUrl}/login" 
               style="background-color: #C66A3D; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
               Iniciar Sesión
            </a>

            <p style="margin-top: 25px; font-size: 0.85em; color: #BFA58A;">
                * Por seguridad, te recomendamos cambiar tu contraseña una vez que ingreses al panel de Inquilino.
            </p>
            <p style="font-size: 0.85em; color: #BFA58A;">Gracias por usar MiRentaAPP.</p>
        </div>
      `;

      try {
        // Enviamos el correo real usando tu mailer configurado con Gmail
        await sendMail({
          to: solInfo.correo_cliente,
          subject: subject,
          html: html,
        });
      } catch (mailError) {
        // Si falla el envío, dejamos que el servidor siga funcionando sin detenerse.
      }
    }

    res.status(201).json(contrato);

  } catch (error) {
    console.error("❌ Error al crear contrato:", error);
    res.status(500).json({ error: 'Error al crear contrato y enviar accesos.' });
  }
};

// ✅ LISTAR CONTRATOS
export const listar = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id, 
        c.fecha_inicio, 
        c.fecha_fin, 
        c.monto_mensual AS canon, 
        c.estado,
        s.nombre_cliente,
        p.sector AS nombre_propiedad
      FROM contratos c
      LEFT JOIN solicitudes_arriendo s ON c.solicitud_id = s.id
      LEFT JOIN propiedades p ON c.propiedad_id = p.id
      ORDER BY c.id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar contratos' });
  }
};

// ✅ ACTUALIZAR CONTRATO
export const actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha_inicio, fecha_fin, canon, estado } = req.body;
    await pool.query(
      `UPDATE contratos 
       SET fecha_inicio = $1, fecha_fin = $2, monto_mensual = $3, estado = $4
       WHERE id = $5`,
      [fecha_inicio, fecha_fin, canon, estado, id]
    );
    res.json({ message: 'Contrato actualizado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar contrato' });
  }
};
