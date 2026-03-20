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

// 🔥 FUNCIÓN TIPO TANQUE: Busca tu información ignorando si el token está roto o viejo
const obtenerInquilinoReal = async (req) => {
  try {
    const usuarioIdGeneral = req.user.id; 
    if (!usuarioIdGeneral) return null; // Si ni siquiera hay ID general, rechazamos.

    // 1. Vamos directo a la Base de Datos a sacar tu correo real, sin importar lo que diga el navegador.
    const usuarioBD = await pool.query('SELECT email FROM usuarios WHERE id = $1', [usuarioIdGeneral]);
    
    if (usuarioBD.rows.length > 0) {
      const correoReal = usuarioBD.rows[0].email;
      req.user.email = correoReal; // Lo guardamos para el chismoso de abajo

      // 2. Con tu correo real, sacamos tu ID exacto de la tabla de inquilinos.
      const inq = await pool.query('SELECT id FROM inquilinos WHERE email = $1', [correoReal]);
      if (inq.rows.length > 0) {
        return inq.rows[0].id; // ¡ENCONTRADO A LA FUERZA!
      }
    }
    return null;
  } catch (error) {
    return null;
  }
};

// ==========================================
// MI DASHBOARD INQUILINO
// ==========================================
router.get('/mi-dashboard', verifyToken, async (req, res) => {
  try {
    const inquilinoId = await obtenerInquilinoReal(req);
    
    console.log(`\n=================================`);
    console.log(`🔍 [DEBUG] DASHBOARD DE INQUILINO`);
    console.log(`👤 ID General del Token: ${req.user.id}`);
    console.log(`📧 Correo Real (BD): ${req.user.email || 'No encontrado'}`);
    console.log(`🔑 ID Inquilino Encontrado: ${inquilinoId}`);

    if (!inquilinoId) {
      console.log(`❌ ERROR: No te encontré en la tabla 'inquilinos'.`);
      console.log(`=================================\n`);
      return res.json({
        tipoUsuario: 'inquilino', contrato: null, pagosPendientes: 0,
        estadisticas: { cuotasPendientes: 0, totalAbonado: 0, saldoPendiente: 0, porcentajeProgreso: 0 },
        ultimoPago: null, proximoPago: null
      });
    }

    const miContrato = await pool.query(`
      SELECT c.*, p.id as codigo, p.direccion, p.precio_mensual
      FROM contratos c
      JOIN propiedades p ON c.propiedad_id = p.id
      WHERE c.inquilino_id = $1 AND c.estado = 'activo'
      ORDER BY c.fecha_inicio DESC
      LIMIT 1
    `, [inquilinoId]);

    console.log(`📄 Contratos ACTIVOS encontrados: ${miContrato.rows.length}`);
    console.log(`=================================\n`);

    if (miContrato.rows.length === 0) {
      return res.json({
        tipoUsuario: 'inquilino', contrato: null, pagosPendientes: 0,
        estadisticas: { cuotasPendientes: 0, totalAbonado: 0, saldoPendiente: 0, porcentajeProgreso: 0 },
        ultimoPago: null, proximoPago: null
      });
    }

    const pagosPendientes = await pool.query(`
      SELECT COUNT(*) as total FROM pagos p
      JOIN contratos c ON p.contrato_id = c.id
      WHERE c.inquilino_id = $1 AND p.estado IN ('pendiente', 'atrasado')
    `, [inquilinoId]);

    const ultimoPago = await pool.query(`
      SELECT p.*, c.monto_mensual FROM pagos p
      JOIN contratos c ON p.contrato_id = c.id
      WHERE c.inquilino_id = $1 AND p.estado = 'aprobado'
      ORDER BY p.fecha_pago DESC LIMIT 1
    `, [inquilinoId]);

    const proximoPago = await pool.query(`
      SELECT p.* FROM pagos p
      JOIN contratos c ON p.contrato_id = c.id
      WHERE c.inquilino_id = $1 AND p.estado = 'pendiente'
      ORDER BY p.fecha_vencimiento ASC LIMIT 1
    `, [inquilinoId]);

    const totalPendientes = parseInt(pagosPendientes.rows[0].total);

    res.json({
      tipoUsuario: 'inquilino', contrato: miContrato.rows[0],
      pagosPendientes: totalPendientes,
      estadisticas: { cuotasPendientes: totalPendientes },
      ultimoPago: ultimoPago.rows[0] || null, proximoPago: proximoPago.rows[0] || null
    });
  } catch (error) {
    console.error('❌ Error /mi-dashboard:', error);
    res.status(500).json({ message: 'Error al obtener dashboard' });
  }
});

router.get('/mi-departamento', verifyToken, async (req, res) => {
  try {
    const inquilinoId = await obtenerInquilinoReal(req);
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

router.get('/mi-contrato', verifyToken, async (req, res) => {
  try {
    const inquilinoId = await obtenerInquilinoReal(req);
    if (!inquilinoId) return res.json(null);

    const result = await pool.query(`
      SELECT c.*, p.id as departamento_codigo, p.direccion as departamento_direccion,
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

router.get('/mis-pagos', verifyToken, async (req, res) => {
  try {
    const inquilinoId = await obtenerInquilinoReal(req);
    if (!inquilinoId) return res.json([]); 

    const result = await pool.query(`
      SELECT p.*, c.monto_mensual, pr.id as departamento_codigo
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

// ✅ RUTA DE PAGOS CORREGIDA
router.post('/pagos', verifyToken, async (req, res) => { 
  try {
    const inquilinoId = await obtenerInquilinoReal(req);
    if (!inquilinoId) return res.status(400).json({ message: 'Aún no tienes contrato' });

    const { mes, monto, metodo, comprobante_url } = req.body; 
    const contrato = await pool.query(`SELECT id FROM contratos WHERE inquilino_id = $1 AND estado = 'activo' LIMIT 1`, [inquilinoId]);

    if (contrato.rows.length === 0) return res.status(404).json({ message: 'No tienes contrato activo' });
    if (!mes || !monto) return res.status(400).json({ message: 'Faltan campos' });

    console.log(`[BACKEND] Intentando guardar pago de $${monto} para el mes de ${mes}...`);

    const result = await pool.query(`
      INSERT INTO pagos (contrato_id, mes, monto, fecha_pago, fecha_vencimiento, metodo_pago, estado, registrado_por, comprobante) 
      VALUES ($1, $2, $3, CURRENT_DATE, CURRENT_DATE + INTERVAL '5 days', $4, 'pendiente', $5, $6) RETURNING *
    `, [contrato.rows[0].id, mes, monto, metodo || 'transferencia', req.user.id, comprobante_url || null]);
    
    console.log(`[BACKEND] ✅ Pago guardado con éxito en la BD.`);
    res.status(201).json({ message: 'Pago enviado a revisión exitosamente', pago: result.rows[0] });
  } catch (error) {
    console.error('\n❌ ERROR EXACTO AL GUARDAR PAGO:');
    console.error(error.message);
    console.error('====================================\n');
    res.status(500).json({ message: 'Error al registrar pago' });
  }
});

// ==========================================
// 🔥 PERFIL (Obtener y Guardar Datos)
// ==========================================
router.get('/mi-perfil', verifyToken, async (req, res) => {
  try {
    const inquilinoId = await obtenerInquilinoReal(req);
    if (!inquilinoId) return res.json(null);
    const result = await pool.query('SELECT * FROM inquilinos WHERE id = $1', [inquilinoId]);
    res.json(result.rows[0] || null);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener perfil' });
  }
});

// ✅ CORRECCIÓN CLAVE: Agregamos cédula y quitamos fecha_nacimiento
router.put('/mi-perfil', verifyToken, async (req, res) => {
  try {
    const inquilinoId = await obtenerInquilinoReal(req);
    if (!inquilinoId) return res.status(400).json({ message: 'Usuario no asociado' });
    
    // Recibimos la cédula desde el frontend en lugar de fecha_nacimiento
    const { nombre, apellido, cedula, telefono, ocupacion } = req.body;
    
    const result = await pool.query(
      `UPDATE inquilinos 
       SET nombre = $1, apellido = $2, cedula = $3, telefono = $4, ocupacion = $5, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $6 RETURNING *`,
      [nombre, apellido, cedula, telefono, ocupacion, inquilinoId]
    );
    
    res.json({ message: 'Perfil actualizado', perfil: result.rows[0] });
  } catch (error) {
    console.error("❌ Error al actualizar perfil:", error.message);
    res.status(500).json({ message: 'Error al actualizar perfil' });
  }
});
// ==========================================
// 🛠️ MANTENIMIENTOS (Recuperado tras la mezcla de Git)
// ==========================================
router.get('/mantenimientos', verifyToken, async (req, res) => {
  try {
    const inquilinoId = await obtenerInquilinoReal(req);
    if (!inquilinoId) return res.json([]);

    const result = await pool.query(`
      SELECT * FROM mantenimientos 
      WHERE inquilino_id = $1 
      ORDER BY fecha_reporte DESC
    `, [inquilinoId]);

    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener mantenimientos:', error);
    res.status(500).json({ message: 'Error al cargar mantenimientos' });
  }
});

router.post('/mantenimientos', verifyToken, async (req, res) => {
  try {
    const inquilinoId = await obtenerInquilinoReal(req);
    if (!inquilinoId) return res.status(400).json({ message: 'Aún no tienes contrato' });

    // 1. Buscar a qué propiedad pertenece este inquilino
    const contrato = await pool.query(`
      SELECT propiedad_id FROM contratos WHERE inquilino_id = $1 AND estado = 'activo' LIMIT 1
    `, [inquilinoId]);

    if (contrato.rows.length === 0) {
      return res.status(404).json({ message: 'No tienes un contrato activo para reportar daños' });
    }

    const propiedadId = contrato.rows[0].propiedad_id;
    const { descripcion, foto_url } = req.body;

    if (!descripcion) return res.status(400).json({ message: 'La descripción es obligatoria' });

    console.log(`[BACKEND] Guardando reporte de mantenimiento del inquilino ${inquilinoId}...`);

    // 2. Guardar el reporte
    const result = await pool.query(`
      INSERT INTO mantenimientos (propiedad_id, inquilino_id, descripcion, foto_url, estado) 
      VALUES ($1, $2, $3, $4, 'Pendiente') RETURNING *
    `, [propiedadId, inquilinoId, descripcion, foto_url || null]);
    
    console.log(`[BACKEND] ✅ Reporte guardado con éxito.`);
    res.status(201).json({ message: 'Reporte enviado a revisión exitosamente', mantenimiento: result.rows[0] });
  } catch (error) {
    console.error('\n❌ ERROR AL GUARDAR MANTENIMIENTO:');
    console.error(error.message);
    res.status(500).json({ message: 'Error al registrar el reporte' });
  }
});


export default router;