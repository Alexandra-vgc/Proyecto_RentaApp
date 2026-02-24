import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import inquilinoRoutes from './routes/inquilinoRoutes.js';
import compradorRoutes from './routes/compradorRoutes.js';

dotenv.config();

const app = express();
const PORT = 5000;
const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error conectando a PostgreSQL:', err.message);
  } else {
    console.log('✅ PostgreSQL conectado exitosamente');
    release();
  }
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'API OK ✅' }));

// ====================================
// LOGIN
// ====================================
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('\n=== INICIO LOGIN ===');
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
    
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        rol: user.rol,
        inquilino_id: user.inquilino_id,
        comprador_id: user.comprador_id
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    console.log('✅ Login exitoso:', user.email);
    console.log('📌 Inquilino ID:', user.inquilino_id);
    console.log('📌 Comprador ID:', user.comprador_id);
    
    res.json({ 
      message: 'Login exitoso', 
      token, 
      user: { 
        id: user.id, 
        nombre: user.nombre, 
        email: user.email, 
        rol: user.rol,
        inquilino_id: user.inquilino_id,
        comprador_id: user.comprador_id
      } 
    });
  } catch (error) {
    console.error('❌ ERROR EN LOGIN:', error);
    res.status(500).json({ message: 'Error en login' });
  }
});

// ====================================
// REGISTRO
// ====================================
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('\n=== INICIO REGISTRO ===');
    const { nombre, email, password, rol, tipo } = req.body;
    
    const existe = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ message: 'Email ya registrado' });
    }
    
    const hash = await bcrypt.hash(password, 10);
    
    let inquilinoId = null;
    let compradorId = null;
    
    // SI ES INQUILINO
    if (rol === 'inquilino' && tipo === 'inquilino') {
      console.log('📝 Creando inquilino...');
      
      const nombreCompleto = nombre.trim().split(' ');
      const nombreInquilino = nombreCompleto[0];
      const apellidoInquilino = nombreCompleto.slice(1).join(' ') || nombreInquilino;
      
      const inquilinoResult = await pool.query(
        `INSERT INTO inquilinos (nombre, apellido, cedula, email, telefono, estado) 
         VALUES ($1, $2, $3, $4, $5, 'activo') 
         RETURNING id`,
        [nombreInquilino, apellidoInquilino, '0000000000', email, '0000000000']
      );
      
      inquilinoId = inquilinoResult.rows[0].id;
      console.log('✅ Inquilino creado con ID:', inquilinoId);
    }
    
    // SI ES COMPRADOR
    if (rol === 'inquilino' && tipo === 'comprador') {
      console.log('📝 Creando comprador...');
      
      const nombreCompleto = nombre.trim().split(' ');
      const nombreComprador = nombreCompleto[0];
      const apellidoComprador = nombreCompleto.slice(1).join(' ') || nombreComprador;
      
      const compradorResult = await pool.query(
        `INSERT INTO compradores (nombre, apellido, cedula, email, telefono, estado) 
         VALUES ($1, $2, $3, $4, $5, 'activo') 
         RETURNING id`,
        [nombreComprador, apellidoComprador, '0000000000', email, '0000000000']
      );
      
      compradorId = compradorResult.rows[0].id;
      console.log('✅ Comprador creado con ID:', compradorId);
    }
    
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, rol, inquilino_id, comprador_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', 
      [nombre, email, hash, rol || 'inquilino', inquilinoId, compradorId]
    );
    
    const token = jwt.sign(
      { 
        id: result.rows[0].id, 
        email: result.rows[0].email, 
        rol: result.rows[0].rol,
        inquilino_id: inquilinoId,
        comprador_id: compradorId
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    console.log('✅ Registro exitoso:', result.rows[0].email);
    
    res.json({ 
      message: 'Registrado', 
      token, 
      user: {
        id: result.rows[0].id,
        nombre: result.rows[0].nombre,
        email: result.rows[0].email,
        rol: result.rows[0].rol,
        inquilino_id: inquilinoId,
        comprador_id: compradorId
      }
    });
  } catch (error) {
    console.error('❌ ERROR EN REGISTRO:', error);
    res.status(500).json({ message: 'Error en registro', error: error.message });
  }
});

// ====================================
// RUTAS
// ====================================
app.use('/api/inquilino', inquilinoRoutes);
app.use('/api/comprador', compradorRoutes);

app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));