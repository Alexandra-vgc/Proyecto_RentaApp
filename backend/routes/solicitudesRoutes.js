import express from 'express';
import { crearSolicitud, listarPorPropietario, aprobar, rechazar } from '../controllers/solicitudesController.js';

const router = express.Router();

router.post('/', crearSolicitud); // Crear solicitud
router.get('/propietario/:id', listarPorPropietario); // Listar solicitudes por propietario
router.put('/aprobar/:id', aprobar); // Aprobar solicitud
router.put('/rechazar/:id', rechazar); // Rechazar solicitud

export default router;