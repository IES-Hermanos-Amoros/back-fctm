const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { protect } = require('../middlewares/jwt.mw');
const { restrictTo } = require('../middlewares/profile.mw');
const { isSelf } = require('../middlewares/isSelf.mw');

router.get('/', protect, restrictTo("ADMINISTRADOR", "PROFESOR", "EMPRESA"), studentController.getAllStudents);

// Actualización masiva de aptitudes
router.patch('/bulk-update', protect, restrictTo("ADMINISTRADOR", "PROFESOR"), studentController.bulkUpdateSkills);

//Logueado y ser admin, teacher, company o student propio (un student no puede acceder a los detalles de otros students)
router.get('/:id', protect, isSelf(["ADMINISTRADOR", "PROFESOR", "EMPRESA"], "id"), studentController.getStudentById);

//Logueado y ser admin, teacher o student propio (un student no puede modfiicar los detalles de otros students) (una empresa tampoco podrá modificar el perfil de un estudiante)
router.patch('/:id', protect, isSelf(["ADMINISTRADOR", "PROFESOR"], "id"), studentController.updateStudentFctm);

module.exports = router;