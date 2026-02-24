import pool from '../config/database.js';

export const crearSolicitud = async (req, res) => {
    const { propiedad_id, nombre_cliente } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO solicitudes_arriendo (propiedad_id, nombre_cliente, estado) VALUES ($1, $2, $3) RETURNING *',
            [propiedad_id, nombre_cliente, 'pendiente']
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const listarPorPropietario = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT s.*, p.sector as nombre_propiedad 
       FROM solicitudes_arriendo s 
       JOIN propiedades p ON s.propiedad_id = p.id 
       WHERE p.id_propietario = $1 
       ORDER BY s.fecha_solicitud DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const aprobar = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('UPDATE solicitudes_arriendo SET estado = $1 WHERE id = $2', ['aprobada', id]);
        res.json({ mensaje: "Solicitud aprobada" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const rechazar = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('UPDATE solicitudes_arriendo SET estado = $1 WHERE id = $2', ['rechazada', id]);
        res.json({ mensaje: "Solicitud rechazada" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};