import express from 'express';
// Importamos las funciones entre llaves { }
import { listarIncumplimientos, crearIncumplimiento } from '../controllers/incumplimientosController.js';

const router = express.Router();

router.get('/', listarIncumplimientos);
router.post('/', crearIncumplimiento); // Si aquí pusiste algo que no importaste arriba, da el error de "Undefined"

export default router;