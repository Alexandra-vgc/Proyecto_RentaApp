import express from 'express';
import * as pagosController from '../controllers/pagosController.js';

const router = express.Router();

// Registrar pago
router.post('/', pagosController.registrar);

// Listar pagos por contrato
router.get('/:id', pagosController.listarPorContrato);

export default router;
