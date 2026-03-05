import { transporter } from "../nodemailer.config.js"

console.log("⏳ Verificando conexión con Brevo...");

transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Error de configuración:");
    console.error(error);
  } else {
    console.log("✅ ¡Todo bien! Nodemailer puede enviar correos.");
  }
  process.exit(); // Detiene el script tras la respuesta
});