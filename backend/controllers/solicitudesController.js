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

        // Formatear fecha para el correo
        const fechaFormateada = new Date(solicitud.fecha_cita).toLocaleDateString('es-EC', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        if (solicitud.correo_cliente) {
            const subject = "✅ Tu cita ha sido ACEPTADA - MiRentaAPP";
            
            // ✅ DISEÑO NUEVO: Solo notificación, sin botones de registro
            const html = `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border: 1px solid #C66A3D; padding: 30px; border-radius: 15px; max-width: 550px; margin: auto; line-height: 1.6;">
                    <h2 style="color: #4E5B3C; text-align: center; margin-bottom: 20px;">¡Confirmación de Cita!</h2>
                    
                    <p style="font-size: 16px; color: #333;">
                        Estimado/a <b>${solicitud.nombre_cliente}</b>,
                    </p>
                    
                    <p style="font-size: 15px; color: #444;">
                        Es un gusto saludarte. Te notificamos que tu solicitud de visita para el inmueble identificado con el código <b>#${solicitud.propiedad_id}</b> ha sido revisada y <b>APROBADA</b> con éxito por el propietario.
                    </p>
                    
                    <div style="background-color: #FDF8F5; border: 1px dashed #C66A3D; padding: 20px; border-radius: 10px; margin: 25px 0;">
                        <h4 style="margin-top: 0; color: #C66A3D; text-transform: uppercase; letter-spacing: 1px;">📍 Información de Encuentro:</h4>
                        <p style="margin: 8px 0; font-size: 15px;"><b>📅 Fecha:</b> ${fechaFormateada}</p>
                        <p style="margin: 8px 0; font-size: 15px;"><b>⏰ Hora:</b> ${solicitud.hora_cita} </p>
                        <p style="margin: 8px 0; font-size: 14px; color: #666;"><i>(Se recomienda llegar con 5 minutos de antelación)</i></p>
                    </div>

                    <p style="color: #333; font-size: 15px;">
                        Estamos emocionados de mostrarte tu posible próximo hogar. Esta visita es el primer paso para encontrar el lugar ideal para ti. Por el momento, <b>no necesitas realizar ninguna acción adicional</b> en el sistema.
                    </p>

                    <p style="color: #555; font-size: 14px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px; text-align: center;">
                        Si presentas algún inconveniente o deseas reprogramar, por favor comunícate con nosotros lo antes posible.
                    </p>
                    
                    <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
                        Atentamente,<br>
                        <b>Equipo de Administración MiRentaAPP</b><br>
                        <i>Gestión Digital de Inmuebles</i>
                    </p>
                </div>
            `;
            
            try {
                await sendMail({ to: solicitud.correo_cliente, subject, html });
            } catch (mailError) {
                console.error("Error enviando mail:", mailError);
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