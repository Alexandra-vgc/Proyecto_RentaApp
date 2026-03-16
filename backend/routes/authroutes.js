import express from 'express';
import { register, login, verifyToken, solicitarCodigo, validarCodigo, resetPassword } from '../controllers/authcontroller.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify', verifyToken);

router.post('/recuperar', solicitarCodigo);
router.post('/validar-codigo', validarCodigo);
router.post('/reset-password', resetPassword);

export default router;