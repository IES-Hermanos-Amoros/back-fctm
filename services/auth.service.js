//LOGINSAOFCTM INI
require("dotenv").config();
const {hashPassword,compareLogin,validateStrongPassword} = require("../utils/bcrypt")
//const jwt = require("jsonwebtoken");
const userManager = require("../models/userManager.model");
const AppError = require("../utils/AppError");
const { NODEMAILER_ACTIVE, transporter } = require("../utils/nodemailer.config");
const crypto = require("crypto");
const logger = require("../utils/logger");

/*
const validateStrongPassword = (password) => {
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._\-#])[A-Za-z\d@$!%*?&._\-#]{8,}$/;

  return strongPasswordRegex.test(password);
};
*/


// 🟢 LOGIN PRINCIPAL
exports.login = async ({ username, password }) => {
  if (!username || !password) {
    throw new AppError("Debe proporcionar usuario y contraseña", 400);
  }

  // Buscar usuario
  const user = await userManager
    .findOne({ SAO_username: username })
    .populate({
      path: "FCTM_documents",
      match: { FCTM_document_type: "AVATAR" },
      select: "FCTM_document_url", // El select del documento va DENTRO del objeto populate
      options: {
        sort: { FCTM_inserted_date: -1 },
        limit: 1
      }
    }) // Aquí se cierra correctamente el objeto del populate
    .select("+FCTM_password"); // El select del usuario se encadena al final de la query principal

    console.log("Usuario recién logueado: ", user)

  if (!user) {
    //throw new AppError("Credenciales incorrectas", 401);
    return {
      mode: "SAO_NEWUSER_LOGIN",
      message: "Debe autenticarse mediante SAO (e insertar usuario)"
    };
  }

  // 🔵 CASO 1: Usuario SIN password FCTM → login externo (SAO)
  if (!user.FCTM_password || !user.FCTM_email_verified) {
    return {
      mode: "SAO_LOGIN",
      userId: user._id,
      SAO_id: user.SAO_id,
      message: "USUARIO PENDIENTE DE COMPLETAR REGISTRO. A continuación se realizará una autenticación mediante SAO, con las credenciales facilitadas, para completar el registro (contraseña e email de contacto)"
    };
  }

  // 🔵 CASO 2: Login normal FCTM
  const passwordCorrect = await compareLogin(
    password,
    user.FCTM_password
  );

  if (!passwordCorrect) {
    throw new AppError("Credenciales incorrectas", 401);
  }

  // 🟡 Primer login
  if (user.FCTM_firstLogin) {
    return {
      firstLogin: true,
      userId: user._id,
      SAO_id: user.SAO_id,
      message: "Debe cambiar la contraseña antes de continuar"
    };
  }

  // 🟢 Login válido
  //const token = signToken(user);

  return {
    token:"",
    user: {
      _id: user._id,
      SAO_id: user.SAO_id,
      profile: user.SAO_profile,
      username: user.SAO_username,
      avatar: user.FCTM_documents && user.FCTM_documents.length > 0 
            ? user.FCTM_documents[0].FCTM_document_url 
            : null,
      name: user.SAO_name
    }
  };
};

//Terminar la configuración del usuario
exports.completeFirstLogin = async (userId, newPassword, newPasswordRep, email, emailRep) => {

  if(newPassword != newPasswordRep){
    throw new AppError(
      "Las contraseñas no coinciden",
      400
    );
  }

  if(email != emailRep){
    throw new AppError(
      "Los emails no coinciden",
      400
    );
  }

  if (!validateStrongPassword(newPassword)) {
    throw new AppError(
      "La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y un carácter especial",
      400
    );
  }

  const user = await userManager
    .findById(userId)
    .select("+FCTM_password");

  if (!user) {
    throw new AppError("Usuario no encontrado", 404);
  }

  const emailToken = crypto.randomBytes(32).toString("hex");
  const hashedPassword = await hashPassword(newPassword);

  user.FCTM_password = hashedPassword;
  user.FCTM_firstLogin = false;
  user.FCTM_contact_email = email

  user.FCTM_email_verified = false;
  user.FCTM_email_verification_token = emailToken;
  user.FCTM_email_verification_expires = Date.now() + 1000 * 60 * 60; // 1h

  await user.save();

  //const token = signToken(user);
  const verificationLink = `${process.env.USE_HTTPS === "1" ? "https" : "http"}${process.env.FRONTEND_URL}/verify-email/${emailToken}`;
  //const verificationLink = "https://localhost:3016/api/v2/auth/verify-email/" + emailToken;

  if(NODEMAILER_ACTIVE) {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"FCT Manager - IES Hermanos Amorós" <sanchez.migben@gmail.com>',
      to: email,
      subject: "Verifica tu correo",
      html: `
        <h2>Verifica tu cuenta</h2>
        <p>Haz click en el siguiente enlace:</p>
        <a href="${verificationLink}">
          Verificar correo
        </a>
      `
    });

    console.log(`✅ Correo de verificación enviado a ${email} con link: ${verificationLink}`);
  } else {
    console.warn("⚠️ Nodemailer is disabled. Set NODEMAILER_ACTIVE=1 to enable it.");
    logger.access.info(`⚠️ Simulación: Correo de verificación para ${email} con link: ${verificationLink}`);
    console.log(`⚠️ Simulación: Correo de verificación para ${email} con link: ${verificationLink}`);
  }

  return {
    token:"",
    user: {
      _id: user._id,
      SAO_id: user.SAO_id,
      profile: user.SAO_profile,
      username: user.SAO_username
    },
    mode:"EMAIL_VERIFICATION_REQUIRED",
  };

};

// 🔒 CAMBIAR PASSWORD (usuario logueado)
exports.changePassword = async (
  userId,
  currentPassword,
  newPassword
) => {

  if (!validateStrongPassword(newPassword)) {
    throw new AppError(
      "La nueva contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y un carácter especial",
      400
    );
  }

  const user = await userManager
    .findById(userId) //JERO .findById({SAO_id: userId}) --> Este cambio es muy importante y lo comento, de momento
    .select("+FCTM_password");

  if (!user) {
    throw new AppError("Usuario no encontrado", 404);
  }

  const correct = await compareLogin(
    currentPassword,
    user.FCTM_password
  );

  if (!correct) {
    throw new AppError("La contraseña actual no es correcta", 401);
  }

  const samePassword = await compareLogin(
    newPassword,
    user.FCTM_password
  );

  if (samePassword) {
    throw new AppError(
      "La nueva contraseña no puede ser igual a la anterior",
      400
    );
  }

  const hashedPassword = await hashPassword(newPassword);

  user.FCTM_password = hashedPassword;

  await user.save();

  return { message: "Contraseña actualizada correctamente" };
};

// 🆕 REGISTRAR USUARIO DESDE SAO
exports.registerFromSAO = async (saoData) => {

  console.log("Intentando registrar usuario desde SAO con datos: ", saoData)
  if (!saoData || !saoData.SAO_username) {
    throw new AppError("Datos SAO inválidos", 400);
  }

  const existingUser = await userManager.findOne({
    SAO_username: saoData.SAO_username
  });

  if (existingUser) {
    throw new AppError("El usuario ya existe en FCTM", 400);
  }

  // 🔥 Creamos objeto completo exactamente como viene de SAO
  const userData = {
    ...saoData,            // ← TODOS los campos SAO (incluidos null)

    // 🔐 Campos propios FCTM
    //FCTM_contact_email: saoData.SAO_email || null, //JERO --> Por defecto, el email de contacto se inicializa con el email de SAO (si existe). Luego el usuario podrá cambiarlo en su perfil.
    FCTM_password: null,
    FCTM_firstLogin: true
  };

  const newUser = await userManager.create(userData);

  return {
    status: "FIRST_LOGIN",
    userId: newUser._id,
    SAO_id: newUser.SAO_id,
    message: "Usuario creado. Debe establecer contraseña."
  };
};

// SOLICITAR RECUPERACIÓN DE CONTRASEÑA
exports.requestPasswordRecovery = async (contactEmail) => {
  if (!contactEmail) {
    throw new AppError("Debe proporcionar un email de contacto", 400);
  }

  const user = await userManager.findOne({ FCTM_contact_email: contactEmail });

  if (!user) {
    throw new AppError("No existen usuarios con ese email de contacto", 404);
  }

  const recoveryToken = crypto.randomBytes(32).toString("hex");

  user.FCTM_email_verification_token = recoveryToken;
  user.FCTM_email_verification_expires = Date.now() + 1000 * 60 * 60; // 1h

  await user.save();

  const recoveryLink = `${process.env.USE_HTTPS === "1" ? "https" : "http"}${process.env.FRONTEND_URL}/auth/change-password/${recoveryToken}`;

  if (NODEMAILER_ACTIVE) {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"FCT Manager - IES Hermanos Amorós" <sanchez.migben@gmail.com>',
      to: contactEmail,
      subject: "Recuperación de contraseña",
      html: `
        <h2>Recuperación de contraseña</h2>
        <p>Haz clic en el siguiente enlace para establecer una nueva contraseña:</p>
        <a href="${recoveryLink}">Cambiar contraseña</a>
        <p>Este enlace expirará en 1 hora.</p>
      `
    });
    console.log(`✅ Correo de recuperación enviado a ${contactEmail} con link: ${recoveryLink}`);
  } else {
    console.warn("⚠️ Nodemailer is disabled. Set NODEMAILER_ACTIVE=1 to enable it.");
    logger.access.info(`⚠️ Simulación: Correo de recuperación para ${contactEmail} con link: ${recoveryLink}`);
    console.log(`⚠️ Simulación: Correo de recuperación para ${contactEmail} con link: ${recoveryLink}`);
  }

  return { message: "Se ha enviado un correo con las instrucciones para recuperar la contraseña" };
};

// 🔑 CAMBIAR CONTRASEÑA POR TOKEN (recuperación)
exports.changePasswordByToken = async (token, newPassword, newPasswordRep) => {
  if (!token || !newPassword || !newPasswordRep) {
    throw new AppError("Faltan datos requeridos", 400);
  }

  if (newPassword !== newPasswordRep) {
    throw new AppError("Las contraseñas no coinciden", 400);
  }

  if (!validateStrongPassword(newPassword)) {
    throw new AppError(
      "La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y un carácter especial",
      400
    );
  }

  const user = await userManager.findOne({
    FCTM_email_verification_token: token,
    FCTM_email_verification_expires: { $gt: Date.now() }
  }).select("+FCTM_password");

  if (!user) {
    throw new AppError("Token inválido o expirado", 400);
  }

  const hashedPassword = await hashPassword(newPassword);

  user.FCTM_password = hashedPassword;
  user.FCTM_email_verification_token = undefined;
  user.FCTM_email_verification_expires = undefined;

  await user.save();

  return { message: "Contraseña actualizada correctamente. Ya puedes iniciar sesión." };
};

//LOGINSAOFCTM FIN