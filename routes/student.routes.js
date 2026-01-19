// Rutas de Student
const studentController = require('../controllers/student.controller')
const express = require('express') //npm i express
const router = express.Router()

// GET - obtener todos los alumnos
router.get('/', studentController.getAllStudents)

// GET/:id - obtener alumno por id
router.get('/:id', studentController.getStudentById)

// PUT/:id - actualizar alumno por id
router.patch('/:id', studentController.updateStudentFctm)

// Exportar rutas
module.exports = router

