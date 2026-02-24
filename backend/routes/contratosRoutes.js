import express from 'express';
import {
  crear,
  listar,
  actualizar
} from '../controllers/contratosController.js';

const router = express.Router();

router.post('/', crear);
router.get('/', listar);
router.put('/:id', actualizar);

export default router;