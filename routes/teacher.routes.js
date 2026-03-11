const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacher.controller");
const { protect } = require("../middlewares/jwt.mw");
const { restrictTo } = require("../middlewares/profile.mw");
const { isSelf } = require("../middlewares/isSelf.mw");

router.get("/", protect, restrictTo("ADMINISTRADOR", "PROFESOR"), teacherController.findAllTeachers);

router.get("/:id", protect, restrictTo("ADMINISTRADOR", "PROFESOR"), teacherController.findTeacherById);

//Logueado y ser admin o teacher propio (un teacher no puede modificar fichas de otros teacher)
router.patch("/:id", protect, isSelf(["ADMINISTRADOR"], "id"), teacherController.editTeacher);

module.exports = router;