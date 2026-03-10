import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Tu correo de gmail
    pass: process.env.EMAIL_PASS  // Tu contraseña de aplicación de Google
  }
});

// ✅ ASEGURAMOS QUE RECIBA LOS 3 PARÁMETROS CLAVE
export const sendMail = async (options) => { // Cambiamos a recibir un objeto 'options'
  try {
    const mailOptions = {
      from: `"MiRentaApp 🏠" <${process.env.EMAIL_USER}>`,
      to: options.to,      // <--- Aquí es donde Nodemailer busca el correo
      subject: options.subject,
      html: options.html
    };

    console.log("📤 Intentando enviar a:", mailOptions.to);

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("❌ Error real dentro de Nodemailer:", error.message);
    throw error;
  }
};