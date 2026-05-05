const express = require("express");
const router = express.Router();
const companyController = require("../controllers/company.controller");
const { protect } = require("../middlewares/jwt.mw");
const { restrictTo } = require("../middlewares/profile.mw");
const { isSelf } = require("../middlewares/isSelf.mw");

router.get("/", protect, restrictTo("ADMINISTRADOR", "PROFESOR", "ALUMNO"), companyController.getAllCompanies);

// Actualización masiva de aptitudes para empresas
router.patch('/bulk-update', protect, restrictTo("ADMINISTRADOR", "PROFESOR"), companyController.bulkUpdateSkills);

//Logueado y ser admin, teacher, student o company propio (una empresa no debe poder acceder a los detalles de otras empresas)
router.get("/:id", protect, isSelf(["ADMINISTRADOR", "PROFESOR", "ALUMNO"], "id"), companyController.getCompanyById);

//Logueado y ser admin, teacher o company propio (una empresa no debe poder modificar los detalles de otras empresas) (un alumno tampoco podrá modificar nada de una empresa, sólo ver los detalles)
router.patch("/:id", protect, isSelf(["ADMINISTRADOR", "PROFESOR"], "id"), companyController.editCompanyById);

module.exports = router;