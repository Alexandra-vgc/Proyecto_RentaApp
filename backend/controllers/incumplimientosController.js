import pool from '../config/database.js';

// Función para listar
export const listarIncumplimientos = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM incumplimientos ORDER BY id DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Función para crear (ESTA ES LA QUE PROBABLEMENTE TE FALTA O ESTÁ MAL NOMBRADA)
export const crearIncumplimiento = async (req, res) => {
    const { contrato_id, descripcion, monto_multa } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO incumplimientos (contrato_id, descripcion, monto_multa) VALUES ($1, $2, $3) RETURNING *',
            [contrato_id, descripcion, monto_multa]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};