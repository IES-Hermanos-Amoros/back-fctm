const fctController = require("../controllers/fct.controller")
const express = require("express")
const router = express.Router()

// GET -> Mostrar listado de fcts
router.get("/",fctController.findAllFcts)

// GET/:ID -> Mostrar detalles de un fct
router.get("/:id",fctController.findFctById)

// PUT/:ID -> Updatear un fct
router.patch("/:id",fctController.editFct)

// Exportar rutas
module.exports = router