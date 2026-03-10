import dotenv from "dotenv";
dotenv.config();

import { NODEMAILER_ACTIVE, transporter } from "../nodemailer.config.js";

async function testMail() {

  try {

    console.log("⏳ Verificando conexión con Brevo...");
    await transporter.verify();
    console.log("✅ Nodemailer puede enviar correos");

    console.log("⏳ Enviando correo de prueba...");

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"FCT Manager - IES Hermanos Amorós" <sanchez.migben@gmail.com>',
      to: "ma.sanchezbenito@edu.gva.es",
      subject: "TEST",
      text: "Hola mundo"
    });

    console.log("✅ Email enviado:", info.messageId);

  } catch (error) {

    console.error("❌ Error:", error);

  }

  process.exit();

}

if(NODEMAILER_ACTIVE) {
  testMail();
} else {
  console.warn("⚠️ Nodemailer is disabled. Set NODEMAILER_ACTIVE=1 to enable it.");
  process.exit();
}