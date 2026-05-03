const express = require("express")
const router = express.Router()

const fctController = require("../controllers/fct.controller")

const { protect } = require("../middlewares/jwt.mw")
const { restrictTo } = require("../middlewares/profile.mw")
const { isFctOwner } = require("../middlewares/isFctOwner.mw");

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
  isFctOwner(["ADMINISTRADOR", "PROFESOR"]),
  fctController.findFctById
);

// PATCH -> Actualizar FCT
router.patch(
  "/:id",
  protect,
  restrictTo("ADMINISTRADOR","PROFESOR"),
  fctController.editFct
)

// PATCH -> Relacionar un documento a la FCT
router.patch(
  "/:id/add-document",
  protect,
  isFctOwner(["ADMINISTRADOR", "PROFESOR"]),
  fctController.addDocumentToFct
);

// PATCH -> Desvincular un documento (la "limpieza" de IDs huérfanos)
router.patch(
  "/:id/remove-document/:documentId",
  protect,
  isFctOwner(["ADMINISTRADOR", "PROFESOR"]),
  fctController.removeDocumentFromFct
);

module.exports = router