const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacher.controller");
const { protect } = require("../middlewares/jwt.mw");
const { restrictTo } = require("../middlewares/profile.mw");
const { isSelf } = require("../middlewares/isSelf.mw");

router.get("/", protect, restrictTo("ADMIN", "TEACHER"), teacherController.findAllTeachers);

router.get("/:id", protect, restrictTo("ADMIN", "TEACHER"), teacherController.findTeacherById);

router.patch("/:id", protect, isSelf("ADMIN", "id"), teacherController.editTeacher);

module.exports = router;