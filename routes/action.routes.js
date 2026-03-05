
const actionController = require("../controllers/action.controller")
const upload = require("../middlewares/upload.middleware")
const { protect } = require("../middlewares/jwt.mw")
const { restrictTo } = require("../middlewares/profile.mw")

const express = require("express")
const router = express.Router()

// mostrar listado de acciones
router.get(
  "/",
  protect,
  restrictTo("ADMIN","TEACHER"),
  actionController.getAllActions
)

// crear una accion
router.post(
  "/",
  protect,
  restrictTo("ADMIN","TEACHER"),
  upload.array("files",10),
  actionController.newAction
)

// mostrar accion por id
router.get(
  "/:id",
  protect,
  restrictTo("ADMIN","TEACHER"),
  actionController.getActionById
)

// actualizar accion
router.patch(
  "/:id",
  protect,
  restrictTo("ADMIN","TEACHER"),
  actionController.editActionById
)

// borrar accion
router.delete(
  "/:id",
  protect,
  restrictTo("ADMIN","TEACHER"),
  actionController.deleteActionById
)

module.exports = router