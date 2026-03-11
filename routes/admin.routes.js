const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { protect } = require("../middlewares/jwt.mw");
const { restrictTo } = require("../middlewares/profile.mw");
const { isSelf } = require("../middlewares/isSelf.mw");

router.get("/", protect, restrictTo("ADMIN"), adminController.getAllAdmins);

router.get("/:id", protect, restrictTo("ADMIN"), adminController.getAdminById);

router.patch("/:id", protect, isSelf("ADMIN", "id"), adminController.editAdminById);

module.exports = router;