const fctController = require("../controllers/fct.controller")
const express = require("express")

const { protect } = require("../middlewares/jwt.mw")
const { restrictTo } = require("../middlewares/profile.mw")

const router = express.Router()

// GET listado de fcts
router.get(
  "/",
  protect,
  restrictTo("ADMIN","TEACHER"),
  fctController.findAllFcts
)

// GET fct por id
router.get(
  "/:id",
  protect,
  restrictTo("ADMIN","TEACHER"),
  fctController.findFctById
)

// PATCH actualizar fct
router.patch(
  "/:id",
  protect,
  restrictTo("ADMIN","TEACHER"),
  fctController.editFct
)

module.exports = router