const actionController = require("../controllers/action.controller")
const { upload, validateAndScanFiles } = require("../middlewares/upload.middleware")
const express = require("express")
const router = express.Router()

const { protect } = require("../middlewares/jwt.mw")
const { restrictTo } = require("../middlewares/profile.mw")

// Mostrar listado de acciones
router.get(
  "/",
  protect,
  restrictTo("ADMINISTRADOR","PROFESOR"),
  actionController.getAllActions
)

//crear una accion
router.post("/",protect,restrictTo("ADMINISTRADOR","PROFESOR"), upload.array("files",10), validateAndScanFiles, actionController.newAction)

// Mostrar acción por ID
router.get(
  "/:id",
  protect,
  restrictTo("ADMINISTRADOR","PROFESOR"),
  actionController.getActionById
)

// Actualizar una acción
router.patch(
  "/:id",
  protect,
  restrictTo("ADMINISTRADOR","PROFESOR"),
  upload.array("files",10), validateAndScanFiles,
  actionController.editActionById
)

// Borrar una acción
router.delete(
  "/:id",
  protect,
  restrictTo("ADMINISTRADOR","PROFESOR"),
  actionController.deleteActionById
)

module.exports = router