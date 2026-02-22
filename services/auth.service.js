//LOGINSAOFCTM INI
const {hashPassword,compareLogin} = require("../utils/bcrypt")
const jwt = require("jsonwebtoken");
const userManager = require("../models/userManager.model");
const AppError = require("../utils/appError");

const validateStrongPassword = (password) => {
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._\-#])[A-Za-z\d@$!%*?&._\-#]{8,}$/;

  return strongPasswordRegex.test(password);
};

// 🔐 Generar JWT
// PENDIENTE --> Sustituir por createToken en jwt.mw.js
const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      profile: user.SAO_profile
    },
    process.env.JWT_SECRET || "contraseñasupersecretaJWT",
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d"
    }
  );
};

// 🟢 LOGIN PRINCIPAL
exports.login = async ({ username, password }) => {
  if (!username || !password) {
    throw new AppError("Debe proporcionar usuario y contraseña", 400);
  }

  // Buscar usuario
  const user = await userManager
    .findOne({ SAO_username: username })
    .select("+FCTM_password");

  if (!user) {
    //throw new AppError("Credenciales incorrectas", 401);
    return {
      mode: "SAO_NEWUSER_LOGIN",
      message: "Debe autenticarse mediante SAO (e insertar usuario)"
    };
  }

  // 🔵 CASO 1: Usuario SIN password FCTM → login externo (SAO)
  if (!user.FCTM_password) {
    return {
      mode: "SAO_LOGIN",
      message: "Debe autenticarse mediante SAO y actualizar contraseña"
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
      message: "Debe cambiar la contraseña antes de continuar"
    };
  }

  // 🟢 Login válido
  const token = signToken(user);

  return {
    token,
    user: {
      id: user._id,
      profile: user.SAO_profile,
      name: user.SAO_name
    }
  };
};

//Terminar la configuración del usuario
exports.completeFirstLogin = async (userId, newPassword, newPasswordRep, email) => {

  if(newPassword != newPasswordRep){
    throw new AppError(
      "Las contraseñas no coinciden",
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

  console.log("New Password:", newPassword)
  const hashedPassword = await hashPassword(newPassword);
  console.log("Hashed Password:", hashedPassword)


  user.FCTM_password = hashedPassword;
  user.FCTM_firstLogin = false;
  user.FCTM_contact_email = email

  await user.save();

  const token = signToken(user);

  return {
    token,
    user: {
      id: user._id,
      profile: user.SAO_profile,
      name: user.SAO_name
    }
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
    .findById(userId)
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
    FCTM_password: null,
    FCTM_firstLogin: true
  };

  const newUser = await userManager.create(userData);

  return {
    status: "FIRST_LOGIN",
    userId: newUser._id,
    message: "Usuario creado. Debe establecer contraseña."
  };
};

//LOGINSAOFCTM FIN