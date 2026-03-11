const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { protect } = require('../middlewares/jwt.mw');
const { restrictTo } = require('../middlewares/profile.mw');
const { isSelf } = require('../middlewares/isSelf.mw');

router.get('/', protect, restrictTo("ADMIN", "TEACHER", "COMPANY"), studentController.getAllStudents);

router.get('/:id', protect, isSelf("ADMIN", "TEACHER", "COMPANY", "id"), studentController.getStudentById);

router.patch('/:id', protect, isSelf("ADMIN", "TEACHER", "id"), studentController.updateStudentFctm);

module.exports = router;