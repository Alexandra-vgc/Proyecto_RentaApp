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

// Función para listar
export const listarIncumplimientos = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM incumplimientos ORDER BY id DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Función para crear
export const crearIncumplimiento = async (req, res) => {
    // ✅ CORRECCIÓN: Usamos "tipo" en lugar de "monto_multa" para que coincida con la BD
    const { contrato_id, descripcion, tipo } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO incumplimientos (contrato_id, descripcion, tipo) VALUES ($1, $2, $3) RETURNING *',
            [contrato_id, descripcion, tipo || 'general']
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};