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
const ensureInquilinoData = async (email, nombreCompleto) => {
  if (!email) throw new Error("Email necesario");
  
  let userRes = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
  let usuarioId;

  if (userRes.rows.length > 0) {
    usuarioId = userRes.rows[0].id;
  } else {
    const hashed = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    const newUser = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id',
      [nombreCompleto, email, hashed, 'inquilino']
    );
    usuarioId = newUser.rows[0].id;
  }

  const inquilinoRes = await pool.query('SELECT id FROM inquilinos WHERE email = $1', [email]);
  
  if (inquilinoRes.rows.length === 0) {
    const partes = (nombreCompleto || 'Nuevo Inquilino').split(' ');
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
    const { solicitud_id, fecha_inicio, fecha_fin, canon } = req.body;

    const solRes = await pool.query(
      'SELECT propiedad_id, correo_cliente, nombre_cliente FROM solicitudes_arriendo WHERE id = $1',
      [solicitud_id]
    );

    if (solRes.rows.length === 0) return res.status(404).json({ error: 'Solicitud no encontrada' });

    const datos = solRes.rows[0];
    const emailInquilino = datos.correo_cliente; 
    const nombreInquilino = datos.nombre_cliente;

    const idLegalParaContrato = await ensureInquilinoData(emailInquilino, nombreInquilino);

    const result = await pool.query(
      `INSERT INTO contratos (solicitud_id, propiedad_id, inquilino_id, fecha_inicio, fecha_fin, monto_mensual, dia_pago, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [solicitud_id, datos.propiedad_id, idLegalParaContrato, fecha_inicio, fecha_fin, canon || 0, 1, 'activo']
    );

    // Envío de correo con el objeto corregido
    try {
      if (emailInquilino) {
        await sendMail({
          to: emailInquilino,
          subject: "🔑 Tus credenciales de acceso - MiRentaApp",
          html: `<h2>¡Bienvenido, ${nombreInquilino}!</h2><p>Email: ${emailInquilino}<br>Clave: ${DEFAULT_PASSWORD}</p>`
        });
      }
    } catch (mailErr) {
      console.error("⚠️ Error de correo:", mailErr.message);
    }

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error("❌ ERROR AL GENERAR CONTRATO:", error.message);
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