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

// ==========================================
// MI DASHBOARD INQUILINO (Corregido para usuarios nuevos)
// ==========================================
router.get('/mi-dashboard', verifyToken, async (req, res) => {
  try {
    const inquilinoId = req.user.inquilino_id;
    
    // ✅ CORRECCIÓN: Si es usuario nuevo, devolvemos el dashboard vacío (NO un error 400)
    if (!inquilinoId) {
      return res.json({
        tipoUsuario: 'inquilino',
        contrato: null,
        pagosPendientes: 0,
        estadisticas: { cuotasPendientes: 0, totalAbonado: 0, saldoPendiente: 0, porcentajeProgreso: 0 },
        ultimoPago: null,
        proximoPago: null
      });
    }

    const miContrato = await pool.query(`
      SELECT c.*, p.codigo, p.direccion, p.precio_mensual
      FROM contratos c
      JOIN propiedades p ON c.propiedad_id = p.id
      WHERE c.inquilino_id = $1 AND c.estado = 'activo'
      ORDER BY c.fecha_inicio DESC
      LIMIT 1
    `, [inquilinoId]);

    // ✅ CORRECCIÓN: Si no tiene contrato activo, también devolvemos el dashboard vacío
    if (miContrato.rows.length === 0) {
      return res.json({
        tipoUsuario: 'inquilino',
        contrato: null,
        pagosPendientes: 0,
        estadisticas: { cuotasPendientes: 0, totalAbonado: 0, saldoPendiente: 0, porcentajeProgreso: 0 },
        ultimoPago: null,
        proximoPago: null
      });
    }

    const pagosPendientes = await pool.query(`
      SELECT COUNT(*) as total
      FROM pagos p
      JOIN contratos c ON p.contrato_id = c.id
      WHERE c.inquilino_id = $1 AND p.estado IN ('pendiente', 'atrasado')
    `, [inquilinoId]);

    const ultimoPago = await pool.query(`
      SELECT p.*, c.monto_mensual
      FROM pagos p
      JOIN contratos c ON p.contrato_id = c.id
      WHERE c.inquilino_id = $1 AND p.estado = 'aprobado'
      ORDER BY p.fecha_pago DESC
      LIMIT 1
    `, [inquilinoId]);

    const proximoPago = await pool.query(`
      SELECT p.*
      FROM pagos p
      JOIN contratos c ON p.contrato_id = c.id
      WHERE c.inquilino_id = $1 AND p.estado = 'pendiente'
      ORDER BY p.fecha_vencimiento ASC
      LIMIT 1
    `, [inquilinoId]);

    const totalPendientes = parseInt(pagosPendientes.rows[0].total);

    res.json({
      tipoUsuario: 'inquilino',
      contrato: miContrato.rows[0],
      pagosPendientes: totalPendientes,
      estadisticas: {
        cuotasPendientes: totalPendientes 
      },
      ultimoPago: ultimoPago.rows[0] || null,
      proximoPago: proximoPago.rows[0] || null
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ message: 'Error al obtener dashboard' });
  }
});

// ==========================================
// MI DEPARTAMENTO
// ==========================================
router.get('/mi-departamento', verifyToken, async (req, res) => {
  try {
    const inquilinoId = req.user.inquilino_id;
    if (!inquilinoId) return res.json(null);

    const result = await pool.query(`
      SELECT p.*, p.habitaciones AS numero_habitaciones, p.banos AS numero_banos
      FROM propiedades p
      JOIN contratos c ON p.id = c.propiedad_id
      WHERE c.inquilino_id = $1 AND c.estado = 'activo'
      LIMIT 1
    `, [inquilinoId]);

    res.json(result.rows[0] || null);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener departamento' });
  }
});

// ==========================================
// MI CONTRATO
// ==========================================
router.get('/mi-contrato', verifyToken, async (req, res) => {
  try {
    const inquilinoId = req.user.inquilino_id;
    if (!inquilinoId) return res.json(null);

    const result = await pool.query(`
      SELECT c.*, p.codigo as departamento_codigo, p.direccion as departamento_direccion,
             p.habitaciones as numero_habitaciones, p.banos as numero_banos, p.metros_cuadrados
      FROM contratos c
      JOIN propiedades p ON c.propiedad_id = p.id
      WHERE c.inquilino_id = $1 AND c.estado = 'activo'
      ORDER BY c.fecha_inicio DESC
      LIMIT 1
    `, [inquilinoId]);

    res.json(result.rows[0] || null);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener contrato' });
  }
});

// ==========================================
// MIS PAGOS (Historial)
// ==========================================
router.get('/mis-pagos', verifyToken, async (req, res) => {
  try {
    const inquilinoId = req.user.inquilino_id;
    if (!inquilinoId) return res.json([]); // Si es nuevo, devuelve tabla vacía

    const result = await pool.query(`
      SELECT p.*, c.monto_mensual, pr.codigo as departamento_codigo
      FROM pagos p
      JOIN contratos c ON p.contrato_id = c.id
      JOIN propiedades pr ON c.propiedad_id = pr.id
      WHERE c.inquilino_id = $1
      ORDER BY p.fecha_pago DESC
    `, [inquilinoId]);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener pagos' });
  }
});

// ==========================================
// REGISTRAR PAGO (Corregido para coincidir con tu Frontend)
// ==========================================
router.post('/pagos', verifyToken, async (req, res) => { // ✅ CORRECCIÓN: Ahora se llama /pagos
  try {
    const inquilinoId = req.user.inquilino_id;
    
    if (!inquilinoId) {
      return res.status(400).json({ message: 'Aún no tienes un contrato para realizar pagos' });
    }

    // Recibimos los datos exactos que envía tu ventana flotante (RegistrarPago.jsx)
    const { mes, monto, metodo } = req.body; 
    
    const contrato = await pool.query(`
      SELECT id FROM contratos WHERE inquilino_id = $1 AND estado = 'activo' LIMIT 1
    `, [inquilinoId]);

    if (contrato.rows.length === 0) {
      return res.status(404).json({ message: 'No tienes un contrato activo' });
    }

    if (!mes || !monto) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    // Guardamos el pago como "En revisión / pendiente"
    const result = await pool.query(`
      INSERT INTO pagos (
        contrato_id, mes, monto, fecha_pago, fecha_vencimiento, 
        metodo_pago, estado, registrado_por
      ) VALUES ($1, $2, $3, CURRENT_DATE, CURRENT_DATE + INTERVAL '5 days', $4, 'pendiente', $5)
      RETURNING *
    `, [
      contrato.rows[0].id, 
      mes, 
      monto, 
      metodo || 'transferencia',
      req.user.id
    ]);
    
    res.status(201).json({
      message: 'Pago enviado a revisión exitosamente',
      pago: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ message: 'Error al registrar pago', error: error.message });
  }
});

// ==========================================
// VER PERFIL
// ==========================================
router.get('/mi-perfil', verifyToken, async (req, res) => {
  try {
    const inquilinoId = req.user.inquilino_id;
    if (!inquilinoId) return res.json(null);
    const result = await pool.query('SELECT * FROM inquilinos WHERE id = $1', [inquilinoId]);
    res.json(result.rows[0] || null);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener perfil' });
  }
});

// ==========================================
// ACTUALIZAR PERFIL
// ==========================================
router.put('/mi-perfil', verifyToken, async (req, res) => {
  try {
    const inquilinoId = req.user.inquilino_id;
    if (!inquilinoId) return res.status(400).json({ message: 'Usuario no asociado' });
    const { nombre, apellido, telefono, fecha_nacimiento, ocupacion } = req.body;
    const result = await pool.query(
      `UPDATE inquilinos SET nombre = $1, apellido = $2, telefono = $3, 
        fecha_nacimiento = $4, ocupacion = $5, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $6 RETURNING *`,
      [nombre, apellido, telefono, fecha_nacimiento, ocupacion, inquilinoId]
    );
    res.json({ message: 'Perfil actualizado', perfil: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar perfil' });
  }
});

export default router;