const adminController = require("../controllers/admin.controller")
const express = require("express")
const router = express.Router()

router.get("/", adminController.getAllAdmins)

router.get("/:id",adminController.getAdminById)

router.patch("/:id", adminController.editAdminById)

module.exports = router
