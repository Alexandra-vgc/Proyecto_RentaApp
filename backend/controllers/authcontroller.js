import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pg from 'pg';
import dotenv from 'dotenv';
import { sendMail } from '../utils/mailer.js';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

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

const codigosRecuperacion = new Map();

// ✅ LA FUNCIÓN MODIFICADA EMPIEZA AQUÍ
export const solicitarCodigo = async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log(`🔔 [BACKEND] Solicitud de código recibida para: ${email}`);
    
    // Convertimos ambos correos a minúsculas en la búsqueda para evitar errores de tipeo
    const userResult = await pool.query('SELECT * FROM usuarios WHERE LOWER(email) = LOWER($1)', [email]);
    
    if (userResult.rows.length === 0) {
      console.log(`❌ [BACKEND] El correo ${email} no se encontró en la base de datos.`);
      return res.status(400).json({ message: 'No existe una cuenta con este correo.' });
    }

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    codigosRecuperacion.set(email, { codigo, expira: Date.now() + 15 * 60 * 1000 }); 

    console.log(`💌 [BACKEND] Generando código ${codigo}. Intentando enviar correo...`);

    await sendMail({
      to: email,
      subject: '🔑 Código de Recuperación - MiRentaApp',
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
          <h2 style="color: #C66A3D;">Recuperación de contraseña</h2>
          <p>Tu código de seguridad de 6 dígitos es:</p>
          <h1 style="background: #F5EFE6; padding: 15px; letter-spacing: 5px; color: #4A3F35; display: inline-block; border-radius: 8px;">${codigo}</h1>
          <p style="color: #888; font-size: 12px;">Este código expirará en 15 minutos. Si no fuiste tú, ignora este mensaje.</p>
        </div>
      `
    });

    console.log(`✅ [BACKEND] Correo enviado exitosamente a ${email}`);
    res.json({ message: 'Código enviado exitosamente' });

  } catch (error) {
    console.error('🔥 [BACKEND] Error enviando código:', error);
    res.status(500).json({ message: 'Error al enviar el correo.' });
  }
};

export const validarCodigo = (req, res) => {
  const { email, codigo } = req.body;
  const datos = codigosRecuperacion.get(email);

  if (!datos) return res.status(400).json({ message: 'No hay solicitud pendiente para este correo' });
  if (Date.now() > datos.expira) {
    codigosRecuperacion.delete(email);
    return res.status(400).json({ message: 'El código expiró. Solicita uno nuevo.' });
  }
  if (datos.codigo !== codigo) return res.status(400).json({ message: 'El código es incorrecto.' });

  res.json({ message: 'Identidad verificada' });
};

export const resetPassword = async (req, res) => {
  try {
    const { email, nuevaPassword } = req.body;
    const datos = codigosRecuperacion.get(email);

    if (!datos) return res.status(400).json({ message: 'Valida el código primero.' });

    const hash = await bcrypt.hash(nuevaPassword, 10);
    // Aseguramos actualizar el correo sin importar mayúsculas
    await pool.query('UPDATE usuarios SET password = $1 WHERE LOWER(email) = LOWER($2)', [hash, email]);
    
    codigosRecuperacion.delete(email); 
    res.json({ message: 'Contraseña actualizada con éxito' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar contraseña' });
  }
};