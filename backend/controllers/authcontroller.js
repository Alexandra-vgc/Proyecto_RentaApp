import express from 'express';
import { register, login, verifyToken } from '../controllers/authcontroller.js'; // ← Con C mayúscula

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify', verifyToken);

export default router;