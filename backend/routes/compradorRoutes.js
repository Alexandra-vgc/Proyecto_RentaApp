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

// 🔥 FUNCIÓN TIPO TANQUE: Busca tu información real en la BD ignorando el token viejo
const obtenerCompradorReal = async (req) => {
  try {
    const usuarioIdGeneral = req.user.id; 
    if (!usuarioIdGeneral) return null;

    const usuarioBD = await pool.query('SELECT email FROM usuarios WHERE id = $1', [usuarioIdGeneral]);
    
    if (usuarioBD.rows.length > 0) {
      const correoReal = usuarioBD.rows[0].email;
      req.user.email = correoReal;

      const comp = await pool.query('SELECT id FROM compradores WHERE email = $1', [correoReal]);
      if (comp.rows.length > 0) {
        return comp.rows[0].id; // ¡ENCONTRADO A LA FUERZA!
      }
    }
    return null;
  } catch (error) {
    return null;
  }
};

// MI DASHBOARD COMPRADOR
router.get('/mi-dashboard', verifyToken, async (req, res) => {
  try {
    const compradorId = await obtenerCompradorReal(req);
    
    if (!compradorId) {
      return res.json({ message: 'Aún no eres un comprador oficial', contrato: null, estadisticas: {} });
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
      return res.json({ message: 'No tienes contratos de compra activos', contrato: null, estadisticas: {} });
    }

    const finanzasRes = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN estado = 'aprobado' OR estado = 'pagado' THEN monto ELSE 0 END), 0) as total_abonado,
        COUNT(CASE WHEN estado IN ('pendiente', 'atrasado') THEN 1 END) as cuotas_pendientes
      FROM pagos 
      WHERE contrato_id = $1
    `, [contrato.id]);

    const { total_abonado, cuotas_pendientes } = finanzasRes.rows[0];
    
    const precioTotal = parseFloat(contrato.monto_mensual || 0);
    const abonado = parseFloat(total_abonado);
    const saldoPendiente = precioTotal - abonado;
    const porcentajeProgreso = precioTotal > 0 ? ((abonado / precioTotal) * 100).toFixed(2) : 0;

    const proximoPagoRes = await pool.query(`
      SELECT * FROM pagos 
      WHERE contrato_id = $1 AND estado IN ('pendiente', 'atrasado')
      ORDER BY fecha_vencimiento ASC LIMIT 1
    `, [contrato.id]);

    res.json({
      tipoUsuario: 'comprador',
      contrato: contrato,
      estadisticas: {
        precioTotal: precioTotal,
        totalAbonado: abonado,
        saldoPendiente: saldoPendiente > 0 ? saldoPendiente : 0,
        porcentajeProgreso: porcentajeProgreso > 100 ? 100 : porcentajeProgreso,
        cuotasPendientes: parseInt(cuotas_pendientes || 0)
      },
      proximoPago: proximoPagoRes.rows[0] || null
    });
  } catch (error) {
    console.error('❌ Error en Dashboard:', error);
    res.status(500).json({ message: 'Error al obtener dashboard' });
  }
});

// MI DEPARTAMENTO
router.get('/mi-departamento', verifyToken, async (req, res) => {
  try {
    const compradorId = await obtenerCompradorReal(req);
    if (!compradorId) return res.json(null);

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

    res.json(result.rows[0] || null);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ message: 'Error al obtener departamento' });
  }
});

// MI CONTRATO
router.get('/mi-contrato', verifyToken, async (req, res) => {
  try {
    const compradorId = await obtenerCompradorReal(req);
    if (!compradorId) return res.json(null);

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

    res.json(result.rows[0] || null);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ message: 'Error al obtener contrato' });
  }
});

// MIS PAGOS
router.get('/mis-pagos', verifyToken, async (req, res) => {
  try {
    const compradorId = await obtenerCompradorReal(req);
    if (!compradorId) return res.json([]);

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

// ✅ REGISTRAR PAGO (CORREGIDO PARA RECIBIR COMPROBANTES)
router.post('/pagos', verifyToken, async (req, res) => {
  try {
    const compradorId = await obtenerCompradorReal(req);
    if (!compradorId) return res.status(400).json({ message: 'Usuario no asociado a un comprador' });

    // Adaptado a lo que envía el formulario RegistrarPago.jsx
    const { mes, monto, metodo, comprobante_url } = req.body;
    
    const contrato = await pool.query(`
      SELECT id FROM contratos 
      WHERE comprador_id = $1 AND estado = 'activo'
      LIMIT 1
    `, [compradorId]);

    if (contrato.rows.length === 0) {
      return res.status(404).json({ message: 'No tienes un contrato activo' });
    }

    if (!mes || !monto) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    const result = await pool.query(`
      INSERT INTO pagos (contrato_id, mes, monto, fecha_pago, fecha_vencimiento, metodo_pago, estado, registrado_por, comprobante)
      VALUES ($1, $2, $3, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', $4, 'pendiente', $5, $6) RETURNING *
    `, [
      contrato.rows[0].id, 
      mes, 
      monto, 
      metodo || 'transferencia', 
      req.user.id, 
      comprobante_url || null
    ]);
    
    res.status(201).json({
      message: 'Cuota enviada a revisión exitosamente',
      pago: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error al registrar pago:', error);
    res.status(500).json({ message: 'Error al registrar cuota', error: error.message });
  }
});

// VER PERFIL
router.get('/mi-perfil', verifyToken, async (req, res) => {
  try {
    const compradorId = await obtenerCompradorReal(req);
    if (!compradorId) return res.json(null);
    
    const result = await pool.query('SELECT * FROM compradores WHERE id = $1', [compradorId]);
    res.json(result.rows[0] || null);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ message: 'Error al obtener perfil' });
  }
});

// ACTUALIZAR PERFIL
router.put('/mi-perfil', verifyToken, async (req, res) => {
  try {
    const compradorId = await obtenerCompradorReal(req);
    if (!compradorId) return res.status(400).json({ message: 'Usuario no asociado a un comprador' });
    
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