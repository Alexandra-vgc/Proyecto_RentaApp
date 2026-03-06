import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pg from 'pg';

// 1. IMPORTACIÓN DE RUTAS
import inquilinoRoutes from './routes/inquilinoRoutes.js';
import compradorRoutes from './routes/compradorRoutes.js';
import solicitudesRoutes from './routes/solicitudesRoutes.js'; 
import contratosRoutes from './routes/contratosRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const { Pool } = pg;

// Configuración de la Base de Datos
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Verificar conexión
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error de conexión:', err.message);
  } else {
    console.log('✅ PostgreSQL conectado exitosamente');
  }
});

// ==========================================
// RUTAS AUTH
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    
    if (result.rows.length === 0) return res.status(401).json({ message: 'Usuario no encontrado' });
    
    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: 'Contraseña incorrecta' });
    
    const token = jwt.sign(
      { 
        id: user.id, 
        rol: user.rol,
        inquilino_id: user.inquilino_id,
        comprador_id: user.comprador_id 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    res.json({ 
      token, 
      user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } 
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: 'Error en login' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    const existe = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    
    if (existe.rows.length > 0) return res.status(400).json({ message: 'Email ya registrado' });
    
    const hash = await bcrypt.hash(password, 10);
    
    // 🛡️ CANDADO DE SEGURIDAD: Solo dejamos pasar a estos 3. Nadie puede ser 'admin' por aquí.
    const rolesPermitidos = ['propietario', 'comprador', 'inquilino'];
    const rolSeguro = rolesPermitidos.includes(rol) ? rol : 'inquilino';

    const result = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING *', 
      [nombre, email, hash, rolSeguro]
    );
    
    const token = jwt.sign({ id: result.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Registrado', token, user: result.rows[0] });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ message: 'Error en registro' });
  }
});

// ==========================================
// RUTAS DE PROPIEDADES (CRUD PARA LA ADMINISTRADORA)
// ==========================================
app.get('/api/admin/propiedades', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM propiedades ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener propiedades" });
  }
});
// server.js
app.get('/api/admin/propiedades/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Buscamos en la tabla 'propiedades' usando la columna 'id' que vi en tu captura
    const result = await pool.query("SELECT * FROM propiedades WHERE id = $1", [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Propiedad no encontrada" });
    }
    
    res.json(result.rows[0]); 
  } catch (error) {
    console.error("Error al obtener detalle:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.post('/api/admin/propiedades', async (req, res) => {
  try {
    const { sector, ciudad, precio, habitaciones, banos, descripcion, imagen_url } = req.body;
    const codigo = `PROP-${Math.floor(Math.random() * 10000)}`; 
    
    const result = await pool.query(
      'INSERT INTO propiedades (codigo, sector, ciudad, precio_mensual, habitaciones, banos, descripcion, imagen_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [codigo, sector, ciudad, precio, habitaciones, banos, descripcion, imagen_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear la propiedad" });
  }
});

app.put('/api/admin/propiedades/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { sector, ciudad, precio, habitaciones, banos, descripcion, imagen_url } = req.body;
    const result = await pool.query(
      'UPDATE propiedades SET sector=$1, ciudad=$2, precio_mensual=$3, habitaciones=$4, banos=$5, descripcion=$6, imagen_url=$7 WHERE id=$8 RETURNING *',
      [sector, ciudad, precio, habitaciones, banos, descripcion, imagen_url, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar propiedad" });
  }
});

app.delete('/api/admin/propiedades/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM propiedades WHERE id = $1', [id]);
    res.json({ message: 'Propiedad eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar propiedad" });
  }
});

// ==========================================
// VINCULACIÓN DE RUTAS EXTERNAS
// ==========================================
app.use('/api/inquilino', inquilinoRoutes);
app.use('/api/comprador', compradorRoutes);
app.use('/api/solicitudes', solicitudesRoutes); 
app.use('/api/contratos', contratosRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
});