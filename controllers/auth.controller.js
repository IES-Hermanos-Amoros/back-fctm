//LOGINSAOFCTM INI
const userManager = require("../models/userManager.model");
const authService = require("../services/auth.service");
const {wrapAsync} = require("../utils/functions");
const AppError = require("../utils/AppError");
const {createJWT} = require("../middlewares/jwt.mw")

// 🔐 LOGIN
exports.login = wrapAsync(async (req, res, next) => {

    const result = await authService.login(req.body);

    // 🔵 Si requiere login SAO externo e insertar usuario en FCTM
    if (result.mode === "SAO_NEWUSER_LOGIN") {
        return res.status(200).json({
            status: "SAO_NEWUSER_FCTM_REQUIRED",
            message: result.message
        });
    }

    // 🔵 Si requiere login SAO externo
    if (result.mode === "SAO_LOGIN") {
        return res.status(200).json({
            status: "SAO_REQUIRED",
            userId: result.userId,
            SAO_id: result.SAO_id,
            message: result.message
        });
    }

    // 🟡 Si es primer login
    if (result.firstLogin) {
        return res.status(200).json({
            status: "FIRST_LOGIN",
            userId: result.userId,
            SAO_id: result.SAO_id,
            message: result.message
        });
    }

    //Todo ha ido correcto, creamos el token, guardándolo en cookie "jwt" como httpOnly
    result.token = createJWT(req,res,next,result.user)

    // 🟢 Login normal OK
    res.status(200).json({
        status: "SUCCESS",
        token: result.token,
        user: result.user
    });

});


// 🔄 COMPLETAR PRIMER LOGIN
exports.completeFirstLogin = wrapAsync(async (req, res, next) => {

    const { userId, newPassword, newPasswordRep, email, emailRep } = req.body;

    if (!userId || !newPassword || !newPasswordRep || !email || !emailRep) {
        return next(new AppError("Faltan datos (userId, newPassword, newPasswordRep, email, emailRep)", 400));
    }

    const result = await authService.completeFirstLogin(
        userId,
        newPassword,
        newPasswordRep,
        email,
        emailRep
    );


     //Todo ha ido correcto, creamos el token, guardándolo en cookie "jwt" como httpOnly
    //result.token = createJWT(req,res,next,result.user)


    /*res.status(200).json({
        status: "SUCCESS",
        token: result.token,
        user: result.user
    });*/

    res.status(200).json({
        status: result.mode,
        token: result.token,
        user: result.user
    })

});


// 🔒 CAMBIAR PASSWORD (usuario logueado)
exports.changePassword = wrapAsync(async (req, res, next) => {

    const userId = req.user.id; // 🔥 viene del middleware protect
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return next(new AppError("Debe proporcionar ambas contraseñas", 400));
    }

    const result = await authService.changePassword(
        userId,
        currentPassword,
        newPassword
    );

    res.status(200).json({
        status: "SUCCESS",
        message: result.message
    });

});


// 🆕 REGISTRAR DESDE SAO
exports.registerFromSAO = wrapAsync(async (req, res, next) => {

  //const result = await authService.registerFromSAO(req.body.data);
  //JERO
  const result = await authService.registerFromSAO(req.body)


  res.status(201).json(result);

});

//Logout
exports.logout = wrapAsync(async (req, res, next) => {
    // Borramos la cookie 'jwt'
    res.clearCookie("jwt", {
        httpOnly: true,
        secure: true, // Mantener igual que cuando se creó
        sameSite: "none",
        path: "/", // Aseguramos el path raíz
    });
    
    // Borramos la cookie 'SAOtoken' 
    res.clearCookie("SAOtoken", {
        httpOnly: true,
        secure: true, // Mantener igual que cuando se creó
        sameSite: "none",
        path: "/", // Aseguramos el path raíz
        expires: new Date(0), // ◄ FUERZA la fecha al 1 de enero de 1970
        maxAge: 0             // ◄ Le dice al navegador que dura 0 segundos
    });

    res.status(200).json({
        status: "SUCCESS",
        message: "Sesión cerrada correctamente y cookie eliminada"
    });
});




//Zustand
exports.getLoguedUser = (req,res,next) => {
    // authMiddleware ya validó la cookie y puso req.user
  if(!req.user) return next(new AppError("No estás logueado", 401));

  res.json({
    success: true,
    user: req.user
  });

}



exports.verifyEmail = wrapAsync(async (req,res,next) => {

    console.log("Verificando email con token:", req.params.token);

  const { token } = req.params;

  const user = await userManager.findOne({
    FCTM_email_verification_token: token,
    FCTM_email_verification_expires: { $gt: Date.now() }
  });

  console.log("Usuario encontrado para verificación:", user ? user._id : "Ninguno");

  if(!user){
    return next(new AppError("Token inválido o expirado",400));
  }

  user.FCTM_email_verified = true;
  user.FCTM_email_verification_token = undefined;
  user.FCTM_email_verification_expires = undefined;

  await user.save();

  res.status(200).json({
    status:"EMAIL_VERIFIED",
    message:"Correo verificado correctamente. Ya puedes iniciar sesión."
  });

});


// SOLICITAR RECUPERACIÓN DE CONTRASEÑA
exports.requestPasswordRecovery = wrapAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Debe proporcionar un email de contacto", 400));
  }

  const result = await authService.requestPasswordRecovery(email);

  res.status(200).json({
    status: "SUCCESS",
    message: result.message
  });
});


// CAMBIAR CONTRASEÑA POR TOKEN (recuperación)
exports.changePasswordByToken = wrapAsync(async (req, res, next) => {
  const { token } = req.params;
  const { newPassword, newPasswordRep } = req.body;

  if (!newPassword || !newPasswordRep) {
    return next(new AppError("Debe proporcionar la nueva contraseña y su confirmación", 400));
  }

  const result = await authService.changePasswordByToken(token, newPassword, newPasswordRep);

  res.status(200).json({
    status: "SUCCESS",
    message: result.message
  });
});

//LOGINSAOFCTM FIN
