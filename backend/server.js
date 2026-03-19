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
import authRoutes from './routes/authroutes.js'; 

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
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Verificar conexión
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error de conexión:', err.message);
  } else {
    console.log('✅ PostgreSQL conectado exitosamente');

    // Asegurar que la tabla de solicitudes tenga la columna de correo
    pool.query(`ALTER TABLE solicitudes_arriendo ADD COLUMN IF NOT EXISTS correo_cliente VARCHAR(255);`)
      .then(() => console.log('✅ Columna correo_cliente disponible en solicitudes_arriendo'))
      .catch((alterErr) => console.error('❌ Error al asegurar columna correo_cliente:', alterErr.message));
  }
});

// ==========================================
// RUTAS AUTH (Las que ya tenías hardcodeadas)
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

app.get('/api/admin/propiedades/:id', async (req, res) => {
  try {
    const { id } = req.params;
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
        const { 
            codigo, sector, ciudad, direccion, 
            precio_mensual, garantia, alicuota,
            habitaciones, banos, metros_cuadrados, parqueaderos,
            tipo_propiedad, estado_amoblado,
            incluye_agua, incluye_luz, incluye_internet, mascotas,
            reglas, descripcion, imagen_url, imagenes_extra, estado,
            latitud, longitud
        } = req.body;

        const precioFinal = precio_mensual || 0;

        const query = `
            INSERT INTO propiedades (
                codigo, sector, ciudad, direccion, 
                precio_mensual, garantia, alicuota,
                habitaciones, banos, metros_cuadrados, parqueaderos,
                tipo_propiedad, estado_amoblado,
                incluye_agua, incluye_luz, incluye_internet, mascotas_permitidas,
                reglas, descripcion, imagen_url, imagenes_extra, estado,
                latitud, longitud
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24) 
            RETURNING *`;

        const values = [
            codigo, sector, ciudad, direccion, 
            precioFinal, garantia || 0, alicuota || 0,
            habitaciones || 0, banos || 0, metros_cuadrados || 0, parqueaderos || 0,
            tipo_propiedad || 'Departamento', estado_amoblado || 'Vacío',
            incluye_agua || false, incluye_luz || false, incluye_internet || false, mascotas || false,
            reglas || '', descripcion || '', imagen_url || null, imagenes_extra || [], estado || 'disponible',
            latitud || null, longitud || null
        ];

        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("❌ Error al insertar propiedad:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/admin/propiedades/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      codigo, sector, ciudad, direccion,
      precio_mensual, garantia, alicuota,
      habitaciones, banos, metros_cuadrados, parqueaderos,
      tipo_propiedad, estado_amoblado,
      incluye_agua, incluye_luz, incluye_internet, mascotas_permitidas,
      reglas, descripcion, imagen_url, imagenes_extra, estado,
      latitud, longitud
    } = req.body;

    const query = `
      UPDATE propiedades SET
        codigo=$1, sector=$2, ciudad=$3, direccion=$4,
        precio_mensual=$5, garantia=$6, alicuota=$7,
        habitaciones=$8, banos=$9, metros_cuadrados=$10, parqueaderos=$11,
        tipo_propiedad=$12, estado_amoblado=$13,
        incluye_agua=$14, incluye_luz=$15, incluye_internet=$16,
        mascotas_permitidas=$17, reglas=$18, descripcion=$19,
        imagen_url=$20, imagenes_extra=$21, estado=$22,
        latitud=$23, longitud=$24
      WHERE id=$25 RETURNING *`;

    const values = [
      codigo, sector, ciudad, direccion,
      precio_mensual || 0, garantia || 0, alicuota || 0,
      habitaciones || 0, banos || 0, metros_cuadrados || 0, parqueaderos || 0,
      tipo_propiedad || 'Departamento', estado_amoblado || 'Vacío',
      incluye_agua || false, incluye_luz || false, incluye_internet || false,
      mascotas_permitidas || false, reglas || '', descripcion || '',
      imagen_url || null, imagenes_extra || [], estado || 'disponible',
      latitud || null, longitud || null,
      id
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Propiedad no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al editar propiedad:", error.message);
    res.status(500).json({ error: error.message });
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
// 🔥 RUTAS DE PAGOS PARA LA ADMINISTRADORA
// ==========================================
app.get('/api/admin/pagos', async (req, res) => {
    try {
        console.log("[BACKEND] Solicitando lista de pagos para el administrador...");
        
        // 🛡️ CONSULTA BLINDADA 
        const query = `
            SELECT 
                p.*, 
                COALESCE(u.nombre, 'Usuario Desconocido') as nombre_cliente, 
                pr.sector as nombre_propiedad 
            FROM pagos p
            LEFT JOIN contratos c ON p.contrato_id = c.id
            LEFT JOIN usuarios u ON u.id = p.registrado_por
            LEFT JOIN propiedades pr ON c.propiedad_id = pr.id
            ORDER BY p.fecha_pago DESC
        `;
        
        const resultado = await pool.query(query);
        console.log(`[BACKEND] ✅ Se enviaron ${resultado.rows.length} pagos al panel.`);
        res.json(resultado.rows);
    } catch (error) {
        console.error("\n❌ ERROR EXACTO AL OBTENER PAGOS (ADMIN):");
        console.error(error.message);
        console.error("=========================================\n");
        res.status(500).json({ mensaje: "Error al cargar los pagos" });
    }
});

app.put('/api/admin/pagos/:id/estado', async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    try {
        const resultado = await pool.query(
            'UPDATE pagos SET estado = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [estado, id]
        );
        res.json({ mensaje: `Pago ${estado} con éxito`, pago: resultado.rows[0] });
    } catch (error) {
        console.error("Error al actualizar el estado del pago:", error);
        res.status(500).json({ mensaje: "Error al actualizar el pago" });
    }
});

// ==========================================
// VINCULACIÓN DE RUTAS EXTERNAS
// ==========================================
app.use('/api/inquilino', inquilinoRoutes);
app.use('/api/comprador', compradorRoutes);
app.use('/api/solicitudes', solicitudesRoutes); 
app.use('/api/contratos', contratosRoutes);
app.use('/api/auth', authRoutes); 

app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
});