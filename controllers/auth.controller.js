//LOGINSAOFCTM INI
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

    const { userId, newPassword, newPasswordRep, email } = req.body;

    if (!userId || !newPassword || !newPasswordRep || !email) {
        return next(new AppError("Faltan datos (userId, newPassword, newPasswordRep, email)", 400));
    }

    const result = await authService.completeFirstLogin(
        userId,
        newPassword,
        newPasswordRep,
        email
    );

     //Todo ha ido correcto, creamos el token, guardándolo en cookie "jwt" como httpOnly
    result.token = createJWT(req,res,next,result.user)


    res.status(200).json({
        status: "SUCCESS",
        token: result.token,
        user: result.user
    });

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

  const result = await authService.registerFromSAO(req.body.data);

  res.status(201).json(result);

});

//LOGINSAOFCTM FIN
