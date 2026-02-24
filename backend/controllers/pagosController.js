import pool from '../config/database.js'; // import en lugar de require

// Registrar un pago
export const registrar = async (req, res) => {
  try {
    const { contrato_id, mes, monto } = req.body;

    await pool.query(
      `INSERT INTO pagos (contrato_id, mes, monto, estado)
       VALUES ($1,$2,$3,'pagado')`,
      [contrato_id, mes, monto]
    );

    res.json({ mensaje: 'Pago registrado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error registrando el pago', error: error.message });
  }
};

// Listar pagos por contrato
export const listarPorContrato = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM pagos WHERE contrato_id=$1',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error listando los pagos', error: error.message });
  }
};
