import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from './config/database.js'; // Asegúrate que el archivo se llame exactamente así

// Importación de Rutas
import solicitudesRoutes from './routes/solicitudesRoutes.js';
import contratosRoutes from './routes/contratosRoutes.js';
import pagosRoutes from './routes/pagosRoutes.js';
import incumplimientosRoutes from './routes/incumplimientosRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middlewares ---
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- Verificación de Conexión a DB al arrancar ---
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error crítico: No se pudo conectar a PostgreSQL:', err.message);
  } else {
    console.log('✅ PostgreSQL conectado exitosamente a las:', res.rows[0].now);
  }
});

// --- Ruta Base de prueba ---
app.get('/', (req, res) => res.json({ message: 'MiRentaAPP API OK ✅' }));

// ==========================================================
// 1. AUTENTICACIÓN (Login y Registro)
// ==========================================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

    if (result.rows.length === 0)
      return res.status(401).json({ message: 'Usuario no encontrado' });

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) return res.status(401).json({ message: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { id: user.id, rol: user.rol }, 
      process.env.JWT_SECRET || 'secret_provisional_123', 
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en login', error: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    const existe = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

    if (existe.rows.length > 0) return res.status(400).json({ message: 'Email ya registrado' });

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol',
      [nombre, email, hash, rol || 'inquilino']
    );

    const token = jwt.sign(
        { id: result.rows[0].id }, 
        process.env.JWT_SECRET || 'secret_provisional_123', 
        { expiresIn: '7d' }
    );
    res.json({ message: 'Registrado con éxito', token, user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Error en registro', error: error.message });
  }
});

// ==========================================================
// 2. RUTAS DE FUNCIONALIDADES (Controladores corregidos)
// ==========================================================
app.use('/api/solicitudes', solicitudesRoutes);
app.use('/api/contratos', contratosRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/incumplimientos', incumplimientosRoutes);

// ==========================================================
// 3. RUTAS DE ADMINISTRACIÓN / PROPIEDADES (CRUD)
// ==========================================================
app.get('/api/admin/propiedades', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM propiedades ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener propiedades" });
  }
});

app.post('/api/admin/propiedades', async (req, res) => {
  try {
   const { sector, ciudad, precio, habitaciones, banos, descripcion, imagen_url, propietario_id } = req.body;

const result = await pool.query(
  'INSERT INTO propiedades (sector, ciudad, precio, habitaciones, banos, descripcion, imagen_url, propietario_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
  [sector, ciudad, precio, habitaciones || 0, banos || 0, descripcion || '', imagen_url, propietario_id]
);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al crear la propiedad" });
  }
});

app.put('/api/admin/propiedades/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { sector, ciudad, precio, habitaciones, banos, imagen_url } = req.body;
    const result = await pool.query(
      'UPDATE propiedades SET sector=$1, ciudad=$2, precio=$3, habitaciones=$4, banos=$5, imagen_url=$6 WHERE id=$7 RETURNING *',
      [sector, ciudad, precio, habitaciones, banos, imagen_url, id]
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

// --- Middleware para rutas no encontradas (404) ---
app.use((req, res) => {
  res.status(404).json({ message: "La ruta solicitada no existe." });
});

// --- Iniciar Servidor ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});