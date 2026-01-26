import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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

// Verificar conexión a PostgreSQL
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

// LOGIN CON LOGS
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('\n=== INICIO LOGIN ===');
    console.log('Body recibido:', req.body);
    
    const { email, password } = req.body;
    console.log('Buscando usuario:', email);
    
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    console.log('Filas encontradas:', result.rows.length);
    
    if (result.rows.length === 0) {
      console.log('❌ Usuario no encontrado');
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    const user = result.rows[0];
    console.log('Usuario encontrado:', user.email);
    console.log('Hash en BD:', user.password);
    
    const isValid = await bcrypt.compare(password, user.password);
    console.log('¿Contraseña válida?:', isValid);
    
    if (!isValid) {
      console.log('❌ Contraseña incorrecta');
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('✅ Login exitoso para:', user.email);
    
    res.json({ 
      message: 'Login exitoso', 
      token, 
      user: { 
        id: user.id, 
        nombre: user.nombre, 
        email: user.email, 
        rol: user.rol 
      } 
    });
  } catch (error) {
    console.error('\n❌ ERROR EN LOGIN:');
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ message: 'Error en login', error: error.message });
  }
});

// REGISTRO CON LOGS
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('\n=== INICIO REGISTRO ===');
    console.log('Body recibido:', req.body);
    
    const { nombre, email, password, rol } = req.body;
    console.log('Verificando si existe:', email);
    
    const existe = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    console.log('Emails existentes:', existe.rows.length);
    
    if (existe.rows.length > 0) {
      console.log('❌ Email ya registrado');
      return res.status(400).json({ message: 'Email ya registrado' });
    }
    
    console.log('Encriptando contraseña...');
    const hash = await bcrypt.hash(password, 10);
    console.log('Hash generado:', hash);
    
    console.log('Insertando usuario...');
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING *', 
      [nombre, email, hash, rol || 'inquilino']
    );
    
    console.log('Usuario creado:', result.rows[0].email);
    
    const token = jwt.sign({ id: result.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('✅ Registro exitoso');
    
    res.json({ 
      message: 'Registrado', 
      token, 
      user: {
        id: result.rows[0].id,
        nombre: result.rows[0].nombre,
        email: result.rows[0].email,
        rol: result.rows[0].rol
      }
    });
  } catch (error) {
    console.error('\n❌ ERROR EN REGISTRO:');
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ message: 'Error en registro', error: error.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));