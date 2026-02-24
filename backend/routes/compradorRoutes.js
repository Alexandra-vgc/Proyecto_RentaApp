import express from 'express';
import pg from 'pg';
import dotenv from 'dotenv';
import { verifyToken } from '../middleware/auth.js';

dotenv.config();

const router = express.Router();
const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// MI DASHBOARD
router.get('/mi-dashboard', verifyToken, async (req, res) => {
  try {
    const compradorId = req.user.comprador_id;
    
    if (!compradorId) {
      return res.status(400).json({ message: 'Usuario no asociado a un comprador' });
    }

    const miContrato = await pool.query(`
      SELECT c.*, d.codigo, d.direccion, d.precio_mensual
      FROM contratos c
      JOIN departamentos d ON c.departamento_id = d.id
      WHERE c.comprador_id = $1 AND c.estado = 'activo'
      ORDER BY c.fecha_inicio DESC
      LIMIT 1
    `, [compradorId]);

    const cuotasPendientes = await pool.query(`
      SELECT COUNT(*) as total
      FROM pagos p
      JOIN contratos c ON p.contrato_id = c.id
      WHERE c.comprador_id = $1 AND p.estado IN ('pendiente', 'atrasado')
    `, [compradorId]);

    const ultimoPago = await pool.query(`
      SELECT p.*, c.monto_mensual
      FROM pagos p
      JOIN contratos c ON p.contrato_id = c.id
      WHERE c.comprador_id = $1
      ORDER BY p.created_at DESC
      LIMIT 1
    `, [compradorId]);

    const proximoPago = await pool.query(`
      SELECT p.*
      FROM pagos p
      JOIN contratos c ON p.contrato_id = c.id
      WHERE c.comprador_id = $1 AND p.estado = 'pendiente'
      ORDER BY p.fecha_vencimiento ASC
      LIMIT 1
    `, [compradorId]);

    // Calcular saldo pendiente
    let saldoPendiente = 0;
    if (miContrato.rows.length > 0) {
      const pagado = await pool.query(`
        SELECT COALESCE(SUM(monto), 0) as total
        FROM pagos p
        JOIN contratos c ON p.contrato_id = c.id
        WHERE c.comprador_id = $1 AND p.estado = 'pagado'
      `, [compradorId]);
      
      const precioTotal = miContrato.rows[0].precio_total || 0;
      saldoPendiente = precioTotal - parseFloat(pagado.rows[0].total);
    }

    res.json({
      tipoUsuario: 'comprador',
      contrato: miContrato.rows[0] || null,
      pagosPendientes: parseInt(cuotasPendientes.rows[0].total),
      ultimoPago: ultimoPago.rows[0] || null,
      proximoPago: proximoPago.rows[0] || null,
      saldoPendiente: saldoPendiente
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ message: 'Error al obtener dashboard' });
  }
});

// MI DEPARTAMENTO
router.get('/mi-departamento', verifyToken, async (req, res) => {
  try {
    const compradorId = req.user.comprador_id;
    
    if (!compradorId) {
      return res.status(400).json({ message: 'Usuario no asociado a un comprador' });
    }

    const result = await pool.query(`
      SELECT d.*
      FROM departamentos d
      JOIN contratos c ON d.id = c.departamento_id
      WHERE c.comprador_id = $1 AND c.estado = 'activo'
      LIMIT 1
    `, [compradorId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No tienes un departamento asignado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ message: 'Error al obtener departamento' });
  }
});

// MI CONTRATO
router.get('/mi-contrato', verifyToken, async (req, res) => {
  try {
    const compradorId = req.user.comprador_id;
    
    if (!compradorId) {
      return res.status(400).json({ message: 'Usuario no asociado a un comprador' });
    }

    const result = await pool.query(`
      SELECT 
        c.*,
        d.codigo as departamento_codigo,
        d.direccion as departamento_direccion,
        d.numero_habitaciones,
        d.numero_banos,
        d.metros_cuadrados
      FROM contratos c
      JOIN departamentos d ON c.departamento_id = d.id
      WHERE c.comprador_id = $1 AND c.estado = 'activo'
      ORDER BY c.fecha_inicio DESC
      LIMIT 1
    `, [compradorId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No tienes un contrato activo' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ message: 'Error al obtener contrato' });
  }
});

// MIS PAGOS
router.get('/mis-pagos', verifyToken, async (req, res) => {
  try {
    const compradorId = req.user.comprador_id;
    
    if (!compradorId) {
      return res.status(400).json({ message: 'Usuario no asociado a un comprador' });
    }

    const result = await pool.query(`
      SELECT p.*, c.monto_mensual, d.codigo as departamento_codigo
      FROM pagos p
      JOIN contratos c ON p.contrato_id = c.id
      JOIN departamentos d ON c.departamento_id = d.id
      WHERE c.comprador_id = $1
      ORDER BY p.mes DESC
    `, [compradorId]);

    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ message: 'Error al obtener pagos' });
  }
});

// REGISTRAR PAGO
router.post('/mis-pagos', verifyToken, async (req, res) => {
  try {
    const compradorId = req.user.comprador_id;
    
    if (!compradorId) {
      return res.status(400).json({ message: 'Usuario no asociado a un comprador' });
    }

    const { mes, monto, fecha_pago, fecha_vencimiento, metodo_pago, notas } = req.body;
    
    const contrato = await pool.query(`
      SELECT id FROM contratos 
      WHERE comprador_id = $1 AND estado = 'activo'
      LIMIT 1
    `, [compradorId]);

    if (contrato.rows.length === 0) {
      return res.status(404).json({ message: 'No tienes un contrato activo' });
    }

    const contratoId = contrato.rows[0].id;

    if (!mes || !monto || !fecha_vencimiento) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    const result = await pool.query(`
      INSERT INTO pagos (
        contrato_id, mes, monto, fecha_pago, fecha_vencimiento, 
        metodo_pago, estado, notas, registrado_por
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      contratoId, 
      mes, 
      monto, 
      fecha_pago || null, 
      fecha_vencimiento,
      metodo_pago || null,
      fecha_pago ? 'pagado' : 'pendiente',
      notas || null,
      req.user.id
    ]);
    
    res.status(201).json({
      message: 'Pago registrado exitosamente',
      pago: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ message: 'Error al registrar pago', error: error.message });
  }
});

// VER PERFIL
router.get('/mi-perfil', verifyToken, async (req, res) => {
  try {
    const compradorId = req.user.comprador_id;
    if (!compradorId) {
      return res.status(400).json({ message: 'Usuario no asociado a un comprador' });
    }
    const result = await pool.query('SELECT * FROM compradores WHERE id = $1', [compradorId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Perfil no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ message: 'Error al obtener perfil' });
  }
});

// ACTUALIZAR PERFIL
router.put('/mi-perfil', verifyToken, async (req, res) => {
  try {
    const compradorId = req.user.comprador_id;
    if (!compradorId) {
      return res.status(400).json({ message: 'Usuario no asociado a un comprador' });
    }
    const { nombre, apellido, telefono, fecha_nacimiento, ocupacion } = req.body;
    const result = await pool.query(
      `UPDATE compradores SET nombre = $1, apellido = $2, telefono = $3, 
       fecha_nacimiento = $4, ocupacion = $5, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $6 RETURNING *`,
      [nombre, apellido, telefono, fecha_nacimiento, ocupacion, compradorId]
    );
    res.json({ message: 'Perfil actualizado', perfil: result.rows[0] });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ message: 'Error al actualizar perfil' });
  }
});

export default router;