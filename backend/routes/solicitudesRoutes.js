import express from 'express';
import pg from 'pg';
import dotenv from 'dotenv';
import { 
  crearSolicitud, 
  listarPorPropietario, 
  aceptarSolicitud, 
  aprobar, 
  rechazar 
} from '../controllers/solicitudesController.js';

dotenv.config();

const router = express.Router();
const { Pool } = pg;

// ✅ CONFIGURACIÓN DEL POOL PARA QUE LA RUTA DE CANCELAR FUNCIONE
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// ==========================================
// RUTAS DE SOLICITUDES
// ==========================================

router.post('/', crearSolicitud); // Crear solicitud
router.get('/propietario/:id', listarPorPropietario); // Listar solicitudes por propietario
router.put('/aceptar/:id', aceptarSolicitud); // Aceptar cita y enviar correo
router.put('/aprobar/:id', aprobar); // Aprobar solicitud (legacy)
router.put('/rechazar/:id', rechazar); // Rechazar solicitud

// ✅ RUTA PARA CANCELAR CITA (SOLUCIÓN AL ERROR POOL IS NOT DEFINED)
router.put('/cancelar/:id', async (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body; 

  try {
    console.log(`[BACKEND] Cancelando cita ID: ${id} con motivo: ${motivo}`);
    
    const result = await pool.query(
      `UPDATE solicitudes_arriendo 
       SET estado = 'cancelada', motivo_cancelacion = $1 
       WHERE id = $2 RETURNING *`,
      [motivo, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No se encontró la cita para cancelar." });
    }

    res.json({ 
      message: "Cita cancelada correctamente", 
      cita: result.rows[0] 
    });
  } catch (error) {
    console.error("❌ Error al cancelar cita:", error.message);
    res.status(500).json({ message: "Error interno al procesar la cancelación" });
  }
});

export default router;