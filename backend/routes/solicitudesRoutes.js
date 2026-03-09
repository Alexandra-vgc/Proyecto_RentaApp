import express from 'express';
import { crearSolicitud, listarPorPropietario, aceptarSolicitud, aprobar, rechazar } from '../controllers/solicitudesController.js';

const router = express.Router();

router.post('/', crearSolicitud); // Crear solicitud
router.get('/propietario/:id', listarPorPropietario); // Listar solicitudes por propietario
router.put('/aceptar/:id', aceptarSolicitud); // Aceptar cita y enviar correo
router.put('/aprobar/:id', aprobar); // Aprobar solicitud (legacy)
router.put('/rechazar/:id', rechazar); // Rechazar solicitud

export default router;