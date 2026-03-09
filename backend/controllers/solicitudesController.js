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

const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

export const crearSolicitud = async (req, res) => {
    const { propiedad_id, arrendatario_id, nombre_cliente, correo_cliente, fecha_cita, hora_cita } = req.body;

    if (!propiedad_id || !nombre_cliente || !correo_cliente || !fecha_cita || !hora_cita) {
        return res.status(400).json({ error: "Faltan datos requeridos para agendar la cita" });
    }

    if (!isValidEmail(correo_cliente)) {
        return res.status(400).json({ error: "El correo electrónico ingresado no es válido" });
    }
    
    try {
        // Limpieza robusta: Si no hay ID o es 0 o texto vacío, forzamos null
        const idParaDB = (arrendatario_id && !isNaN(arrendatario_id)) ? parseInt(arrendatario_id) : null;

        const result = await pool.query(
            `INSERT INTO solicitudes_arriendo 
             (propiedad_id, arrendatario_id, nombre_cliente, correo_cliente, fecha_cita, hora_cita, estado) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [propiedad_id, idParaDB, nombre_cliente, correo_cliente, fecha_cita, hora_cita, 'pendiente']
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("❌ Error al insertar solicitud:", error.message);
        res.status(500).json({ error: "Error interno al procesar la cita" });
    }
};

export const aceptarSolicitud = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            "UPDATE solicitudes_arriendo SET estado = 'aceptada' WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Solicitud no encontrada" });
        }

        const solicitud = result.rows[0];

        // Formatear fecha para el correo (Opcional pero recomendado)
        const fechaFormateada = new Date(solicitud.fecha_cita).toLocaleDateString('es-EC', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        if (solicitud.correo_cliente) {
            const subject = "✅ Tu cita ha sido ACEPTADA - MiRentaAPP";
            const html = `
                <div style="font-family: sans-serif; border: 1px solid #C66A3D; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #4E5B3C;">¡Hola, ${solicitud.nombre_cliente}!</h2>
                    <p>El propietario ha <b>ACEPTADO</b> tu solicitud de visita para el inmueble <b>#${solicitud.propiedad_id}</b>.</p>
                    <p><b>📅 Detalles de la cita confirmada:</b></p>
                    <ul>
                        <li><b>Fecha:</b> ${fechaFormateada}</li>
                        <li><b>Hora:</b> ${solicitud.hora_cita}</li>
                    </ul>
                    <hr style="border: 0; border-top: 1px solid #eee;">
                    <p>Si después de la visita decides arrendar, deberás registrarte con este correo para recibir tu contrato digital:</p>
                    <a href="http://localhost:5173/register" 
                       style="background-color: #C66A3D; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                       Registrarse en MiRentaAPP
                    </a>
                </div>
            `;
            
            // Intento de envío de correo (no rompemos la respuesta si falla)
            try {
                await sendMail({ to: solicitud.correo_cliente, subject, html });
            } catch (mailError) {
                // Se ignora el error de envío para no afectar la respuesta.
            }
        }

        res.json({ mensaje: "Cita aceptada exitosamente", solicitud });
    } catch (error) {
        console.error("Error en aceptarSolicitud:", error);
        res.status(500).json({ error: "Error en el servidor: " + error.message });
    }
};

export const listarPorPropietario = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT s.*, p.sector as sector_propiedad, p.precio_mensual 
             FROM solicitudes_arriendo s 
             JOIN propiedades p ON s.propiedad_id = p.id 
             ORDER BY s.id DESC`
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