import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pg;
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// ✅ CREAR CONTRATO
export const crear = async (req, res) => {
  try {
    const { solicitud_id, fecha_inicio, fecha_fin, canon } = req.body;

    // 1. Buscamos el ID de la propiedad conectada a esta solicitud
    const solRes = await pool.query('SELECT propiedad_id FROM solicitudes_arriendo WHERE id = $1', [solicitud_id]);
    const propiedad_id = solRes.rows.length > 0 ? solRes.rows[0].propiedad_id : null;

    // 2. Insertamos usando los nombres reales de la BD unificada
    const result = await pool.query(
      `INSERT INTO contratos 
      (solicitud_id, propiedad_id, fecha_inicio, fecha_fin, monto_mensual, estado)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [solicitud_id, propiedad_id, fecha_inicio, fecha_fin, canon || 0, 'activo']
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear contrato' });
  }
};

// ✅ LISTAR CONTRATOS
export const listar = async (req, res) => {
  try {
    // Usamos JOIN para unir las tablas y "AS" para darle a tu compañera los nombres que ella espera en su Frontend
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
       SET fecha_inicio = $1,
           fecha_fin = $2,
           monto_mensual = $3,
           estado = $4
       WHERE id = $5`,
      [fecha_inicio, fecha_fin, canon, estado, id]
    );

    res.json({ message: 'Contrato actualizado correctamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar contrato' });
  }
};