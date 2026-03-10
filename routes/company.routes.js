const express = require("express");
const router = express.Router();
const companyController = require("../controllers/company.controller");
const { protect } = require("../middlewares/jwt.mw");
const { restrictTo } = require("../middlewares/profile.mw");
const { isSelf } = require("../middlewares/isSelf.mw");

router.get("/", protect, restrictTo("ADMIN", "TEACHER", "STUDENT"), companyController.getAllCompanies);

router.get("/:id", protect, isSelf("ADMIN", "TEACHER", "STUDENT", "id"), companyController.getCompanyById);

router.patch("/:id", protect, isSelf("ADMIN", "TEACHER", "id"), companyController.editCompanyById);

module.exports = router;