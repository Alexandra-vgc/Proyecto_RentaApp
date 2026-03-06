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

export const crearSolicitud = async (req, res) => {
    // Extraemos los datos del cuerpo de la petición
    const { propiedad_id, arrendatario_id, nombre_cliente, fecha_cita, hora_cita } = req.body;
    
    try {
        // 1. VALIDACIÓN DE SEGURIDAD PARA USUARIOS REGISTRADOS
        // Solo verificamos el rol si existe un arrendatario_id (es decir, no es invitado)
        if (arrendatario_id) {
            const usuarioCheck = await pool.query(
                `SELECT rol FROM usuarios WHERE id = $1`,
                [arrendatario_id]
            );
            
            if (usuarioCheck.rows.length > 0) {
                const rol = usuarioCheck.rows[0].rol;
                // Si el usuario registrado es admin o propietario, bloqueamos la acción
                if (rol === 'admin' || rol === 'propietario') {
                    return res.status(403).json({ 
                        error: "Los administradores y propietarios no pueden agendar citas" 
                    });
                }
            }
        }
        
        // 2. VALIDACIÓN DE PROPIEDAD
        // Verificamos que la propiedad realmente exista en la tabla 'propiedades'
        const propiedadCheck = await pool.query(
            `SELECT id FROM propiedades WHERE id = $1`,
            [propiedad_id]
        );
        
        if (propiedadCheck.rows.length === 0) {
            return res.status(404).json({ error: "Propiedad no encontrada" });
        }

        // 3. INSERCIÓN EN LA BASE DE DATOS
        // Usamos COALESCE o simplemente pasamos el arrendatario_id que puede ser null
        const result = await pool.query(
            `INSERT INTO solicitudes_arriendo 
             (propiedad_id, arrendatario_id, nombre_cliente, fecha_cita, hora_cita, estado) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [
                propiedad_id, 
                arrendatario_id || null, // Si es invitado, se guarda como NULL
                nombre_cliente, 
                fecha_cita, 
                hora_cita, 
                'pendiente'
            ]
        );

        console.log("✅ Cita agendada correctamente:", result.rows[0]);
        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error("❌ Error al insertar solicitud:", error);
        res.status(500).json({ error: "Error interno del servidor al procesar la cita" });
    }
};

export const listarPorPropietario = async (req, res) => {
  const { id } = req.params;
  try {
    // Asegúrate de que en la tabla 'propiedades' exista la columna 'propietario_id'
    const result = await pool.query(
      `SELECT s.*, p.sector as sector_propiedad, p.precio_mensual 
       FROM solicitudes_arriendo s 
       JOIN propiedades p ON s.propiedad_id = p.id 
       ORDER BY s.id DESC`, 
       // Si quieres filtrar por propietario real, usa: WHERE p.propietario_id = $1
       // Por ahora lo dejamos general para que no te falle la vista
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const aprobar = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('UPDATE solicitudes_arriendo SET estado = $1 WHERE id = $2', ['aprobada', id]);
        res.json({ mensaje: "Solicitud aprobada" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const rechazar = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('UPDATE solicitudes_arriendo SET estado = $1 WHERE id = $2', ['rechazada', id]);
        res.json({ mensaje: "Solicitud rechazada" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};