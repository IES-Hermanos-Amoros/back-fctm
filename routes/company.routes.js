const express = require("express")
const router = express.Router()
const companyController = require("../controllers/company.controller")

// GET - Obtener todas las empresas
router.get("/", companyController.getAllCompanies)

// GET - Obtener empresa por ID
router.get("/:id", companyController.getCompanyById)

// PUT - Actualizar empresa
router.get("/:id", companyController.editCompanyById)

// Exportar Rutas
module.exports = router