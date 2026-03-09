import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configuración del transporte para Gmail Real (usa variables de entorno cuando existan)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'nathashamachado07@gmail.com',
    pass: process.env.EMAIL_PASS || 'qvdryvfljnykydqz'
  }
});

/**
 * Función universal para enviar correos
 * @param {Object} options - Contiene: to (destinatario), subject (asunto), html (cuerpo)
 */
export const sendMail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"MiRentaAPP 🏠" <nathashamachado07@gmail.com>`,
      to,
      subject,
      html
    });
    // En producción no mostramos logs de envío de correo.
    return info;
  } catch (error) {
    // En caso de falla, mostramos un log mínimo para saber qué pasó, pero sin loggear cuando todo sale bien.
    console.error("❌ Error al enviar correo (Nodemailer):", error.message);
    throw error;
  }
};