import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

//console.log(process.env.SMTP_HOST, process.env.SMTP_PORT, process.env.SMTP_USER, process.env.SMTP_PASS);

// Creamos el transportador con los datos del .env
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // importante para 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Función para verificar que la conexión es correcta
transporter.verify().then(() => {
  console.log('✅ Conexión con Brevo establecida correctamente');
}).catch((err) => {
  console.error('❌ Error al conectar con Brevo:', err);
});