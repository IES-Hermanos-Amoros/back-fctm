const express = require("express")
const router = express.Router()

const fctController = require("../controllers/fct.controller")

const { protect } = require("../middlewares/jwt.mw")
const { restrictTo } = require("../middlewares/profile.mw")

// GET -> Mostrar listado de FCTs
router.get(
  "/",
  protect,
  //restrictTo("ADMINISTRADOR","PROFESOR"), --> De cara al sprint 5 
  fctController.findAllFcts
)

// GET -> Mostrar FCT por ID
router.get(
  "/:id",
  protect,
  //restrictTo("ADMINISTRADOR","PROFESOR"), --> De cara al sprint 5 
  fctController.findFctById
)

// PATCH -> Actualizar FCT
router.patch(
  "/:id",
  protect,
  restrictTo("ADMINISTRADOR","PROFESOR"),
  fctController.editFct
)

module.exports = router