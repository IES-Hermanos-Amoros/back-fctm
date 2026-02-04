const actionController = require("../controllers/action.controller")
const express = require("express")
const router = express.Router()

//mostrar listado de acciones
router.get("/",actionController.getAllActions)

//crear una accion
router.post("/",actionController.newAction)

//mostrar accion por id
router.get("/:id",actionController.getActionById)

//Updatear una acion
router.put("/:id",actionController.editActionById)

//Borrar una accion
router.delete("/:id",actionController.deleteActionById)

//Exportar rutas
module.exports = router