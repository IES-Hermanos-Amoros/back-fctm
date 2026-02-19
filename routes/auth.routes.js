//LOGINSAOFCTM INI
const express = require("express");
const authController = require("../controllers/auth.controller");
//const protect = require("../middlewares/protect"); // middleware JWT PENDIENTE

const router = express.Router();

// 1 Login
router.post("/login", authController.login);

// 2 Login con SAO (desde sao.routes /sao/login)

// 3 Registrar el usuario con la información de SAO (si no exite en MongoDB)
// Proteger esta ruta PENDIENTE
router.post("/register-from-sao", authController.registerFromSAO);

// 4 Completar primer login (actualizar FCTM_password y FCTM_firstLogin)
router.post("/complete-first-login", authController.completeFirstLogin);


// 5 Cambiar password (requiere estar logueado y esto ya es algo opcional desde el Perfil del Usuario)
//router.patch("/change-password", protect, authController.changePassword);
//PENDIENTE
router.patch("/change-password", authController.changePassword);

module.exports = router;
//LOGINSAOFCTM FIN