const userService = require('../services/student.service')
const AppError = require('../utils/AppError')
const { wrapAsync } = require('../utils/functions')

// Obtener todos los alumnos
exports.getAllStudents = wrapAsync(async (req, res, next) => {
  try {
    const students = await userService.findAll()
    res.status(200).json(students)
  } catch (error) {
    next(new AppError(error.message,500))
  }
})

// Actualizar masivamente aptitudes (skills) de alumnos
exports.bulkUpdateSkills = wrapAsync(async (req, res, next) => {
  try {
    const { ids, skills } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return next(new AppError("Debe proporcionar un array de IDs de alumnos", 400));
    }
    if (!skills || !Array.isArray(skills)) {
      return next(new AppError("Debe proporcionar un array de aptitudes", 400));
    }

    const result = await userService.bulkUpdateSkills(ids, skills);

    res.status(200).json({
      message: 'Aptitudes actualizadas correctamente',
      data: result,
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
});

// Mostrar un alumno por ID
exports.getStudentById = wrapAsync(async (req, res, next) => {
  try {
    const { id } = req.params
    const student = await userService.findById(id)

    if (!student) {
      next(new AppError("Alumno no encontrado",404))
    }

    res.status(200).json(student)
  } catch (error) {
    next(new AppError(error.message,500))
  }
})

// Actualizar campos específicos (FCTM_)
exports.updateStudentFctm = wrapAsync(async (req, res, next) => {
  try {
    const { id } = req.params
    const updateData = req.body

    console.log("\n=== UPDATE STUDENT FCTM ===");
    console.log("ID:", id);
    console.log("Update Data:", JSON.stringify(updateData, null, 2));
    console.log("req.user:", req.user);

    const updatedUser = await userService.updateFctmFields(id, updateData)

    console.log("Updated User:", updatedUser?._id);

    res.status(200).json({
      message: 'Campos FCTM actualizados correctamente',
      data: updatedUser,
    })
  } catch (error) {
    console.log("ERROR en updateStudentFctm:", error.message);
    // Diferenciamos si el error es por falta de campos o por no encontrar al usuario
    const statusCode = error.message.includes('No se han proporcionado')
      ? 400
      : 404
    next(new AppError(error.message,statusCode))
  }
})
