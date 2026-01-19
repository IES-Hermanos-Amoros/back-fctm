const teacherController = require("../controllers/teacher.controller")
const express = require("express")
const router = express.Router()

// GET -> Mostrar listado de teachers
router.get("/",teacherController.findAllTeachers)

// GET/:ID -> Mostrar detalles de un teacher
router.get("/:id",teacherController.findTeacherById)

// PUT -> Updatear un teacher
router.patch("/:id",teacherController.editTeacher)

// Exportar rutas
module.exports = router