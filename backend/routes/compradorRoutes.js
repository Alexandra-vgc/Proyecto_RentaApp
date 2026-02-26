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

// MI DASHBOARD COMPRADOR (Con lógica de estadísticas y barra de progreso)
router.get('/mi-dashboard', verifyToken, async (req, res) => {
  try {
    const compradorId = req.user.comprador_id;
    
    if (!compradorId) {
      return res.status(400).json({ message: 'Usuario no asociado a un comprador' });
    }

    const contratoRes = await pool.query(`
      SELECT c.*, p.codigo, p.direccion 
      FROM contratos c
      JOIN propiedades p ON c.propiedad_id = p.id
      WHERE c.comprador_id = $1 AND c.estado = 'activo'
      LIMIT 1
    `, [compradorId]);

    const contrato = contratoRes.rows[0];

    if (!contrato) {
      return res.json({ message: 'No tienes contratos de compra activos', contrato: null });
    }

    // Resumen financiero optimizado en una consulta
    const finanzasRes = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN estado = 'pagado' THEN monto ELSE 0 END), 0) as total_abonado,
        COUNT(CASE WHEN estado IN ('pendiente', 'atrasado') THEN 1 END) as cuotas_pendientes
      FROM pagos 
      WHERE contrato_id = $1
    `, [contrato.id]);

    const { total_abonado, cuotas_pendientes } = finanzasRes.rows[0];
    
    const precioTotal = parseFloat(contrato.precio_total || 0);
    const abonado = parseFloat(total_abonado);
    const saldoPendiente = precioTotal - abonado;
    const porcentajeProgreso = precioTotal > 0 ? ((abonado / precioTotal) * 100).toFixed(2) : 0;

    const proximoPagoRes = await pool.query(`
      SELECT * FROM pagos 
      WHERE contrato_id = $1 AND estado = 'pendiente'
      ORDER BY fecha_vencimiento ASC LIMIT 1
    `, [contrato.id]);

    res.json({
      tipoUsuario: 'comprador',
      contrato: contrato,
      estadisticas: {
        precioTotal: precioTotal,
        totalAbonado: abonado,
        saldoPendiente: saldoPendiente,
        porcentajeProgreso: porcentajeProgreso,
        cuotasPendientes: parseInt(cuotas_pendientes || 0)
      },
      proximoPago: proximoPagoRes.rows[0] || null
    });
  } catch (error) {
    console.error('❌ Error en Dashboard:', error);
    res.status(500).json({ message: 'Error al obtener dashboard' });
  }
});

// MI DEPARTAMENTO (AHORA PROPIEDAD)
router.get('/mi-departamento', verifyToken, async (req, res) => {
  try {
    const compradorId = req.user.comprador_id;
    
    if (!compradorId) {
      return res.status(400).json({ message: 'Usuario no asociado a un comprador' });
    }

    const result = await pool.query(`
      SELECT 
        p.*, 
        p.habitaciones AS numero_habitaciones, 
        p.banos AS numero_banos
      FROM propiedades p
      JOIN contratos c ON p.id = c.propiedad_id
      WHERE c.comprador_id = $1 AND c.estado = 'activo'
      LIMIT 1
    `, [compradorId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No tienes una propiedad asignada' });
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
        p.codigo as departamento_codigo,
        p.direccion as departamento_direccion,
        p.habitaciones as numero_habitaciones,
        p.banos as numero_banos,
        p.metros_cuadrados
      FROM contratos c
      JOIN propiedades p ON c.propiedad_id = p.id
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
      SELECT p.*, c.monto_mensual, pr.codigo as departamento_codigo
      FROM pagos p
      JOIN contratos c ON p.contrato_id = c.id
      JOIN propiedades pr ON c.propiedad_id = pr.id
      WHERE c.comprador_id = $1
      ORDER BY p.mes DESC
    `, [compradorId]);

    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ message: 'Error al obtener pagos' });
  }
});

// REGISTRAR PAGO (CUOTA)
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
      message: 'Cuota registrada exitosamente',
      pago: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ message: 'Error al registrar cuota', error: error.message });
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