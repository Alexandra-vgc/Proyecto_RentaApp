import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// REGISTRO
export const register = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    const existe = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ message: 'Email ya registrado' });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, email, hash, rol || 'inquilino']
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Registro exitoso',
      token,
      user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error en el registro' });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // BUSCAR SI ES INQUILINO O COMPRADOR
    let inquilinoId = null;
    let compradorId = null;

    if (user.rol === 'inquilino') {
      const inquilino = await pool.query(
        'SELECT id FROM inquilinos WHERE usuario_id = $1',
        [user.id]
      );
      inquilinoId = inquilino.rows[0]?.id || null;
    }

    if (user.rol === 'comprador') {
      const comprador = await pool.query(
        'SELECT id FROM compradores WHERE usuario_id = $1',
        [user.id]
      );
      compradorId = comprador.rows[0]?.id || null;
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        rol: user.rol,
        inquilino_id: inquilinoId,
        comprador_id: compradorId
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: { 
        id: user.id, 
        nombre: user.nombre, 
        email: user.email, 
        rol: user.rol,
        inquilino_id: inquilinoId,
        comprador_id: compradorId
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en login' });
  }
};

// VERIFICAR TOKEN
export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};  