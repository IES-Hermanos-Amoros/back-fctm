import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log(process.env.SMTP_HOST, process.env.SMTP_PORT, process.env.SMTP_USER, process.env.SMTP_PASS);

// Creamos el transportador con los datos del .env
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER || "a4109f001@smtp-brevo.com",
    pass: process.env.SMTP_PASS || "xsmtpsib-a5c0e7261b7adb19f5ba96182576c9c433097f24cbd3f9b50c416e239fa35432-6U4oJpPHcFIgD1H5",
  },
});

// Función para verificar que la conexión es correcta
transporter.verify().then(() => {
  console.log('✅ Conexión con Brevo establecida correctamente');
}).catch((err) => {
  console.error('❌ Error al conectar con Brevo:', err);
});