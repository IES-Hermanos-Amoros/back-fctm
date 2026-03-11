const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { protect } = require("../middlewares/jwt.mw");
const { restrictTo } = require("../middlewares/profile.mw");
const { isSelf } = require("../middlewares/isSelf.mw");

router.get("/", protect, restrictTo("ADMINISTRADOR"), adminController.getAllAdmins);

router.get("/:id", protect, restrictTo("ADMINISTRADOR"), adminController.getAdminById);

//Logueado y ser el admin propio (un admin no puede modificar fichas de otros admin)
router.patch("/:id", protect, isSelf([], "id"), adminController.editAdminById);

module.exports = router;