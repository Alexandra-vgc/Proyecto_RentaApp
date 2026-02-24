import pool from '../config/database.js';

// ✅ CREAR CONTRATO
export const crear = async (req, res) => {
  try {
    const {
      solicitud_id,
      fecha_inicio,
      fecha_fin,
      canon,
      nombre_cliente,
      nombre_propiedad
    } = req.body;

    const result = await pool.query(
      `INSERT INTO contratos 
      (solicitud_id, fecha_inicio, fecha_fin, canon, nombre_cliente, nombre_propiedad, estado)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        solicitud_id,
        fecha_inicio,
        fecha_fin,
        canon,
        nombre_cliente,
        nombre_propiedad,
        'activo'
      ]
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
    const result = await pool.query(
      'SELECT * FROM contratos ORDER BY id DESC'
    );

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
           canon = $3,
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