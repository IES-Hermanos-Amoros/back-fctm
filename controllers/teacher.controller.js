const teacherService = require('../services/teacher.service')
const { wrapAsync } = require("../utils/functions")
const AppError = require("../utils/AppError")

exports.findAllTeachers = wrapAsync(async (req, res, next) => {
    let teachers = await teacherService.getAll()
    if(teachers.length > 0) {
        res.status(200).json(teachers)
    }else{
        next(new AppError("Sin Profesores",404))
    }
})

exports.findTeacherById = wrapAsync(async (req, res, next) => {
    const teacher = await teacherService.getById(req.params.id)
    if(teacher) {
        res.status(200).json(teacher)
    } else {
        next(new AppError("Profesor no encontrado", 404))
    }
})

/*
exports.editTeacher = wrapAsync(async (req, res, next) => {
    const tieneCamposFCTM = Object.keys(req.body)
        .some(key => key.startsWith("FCTM_"))
    if (!tieneCamposFCTM) {
        return next(new AppError("No se pudo actualizar: los campos deben empezar por FCTM_",403))
    }

    const updatedTeacher = await teacherService.update(req.params.id, req.body)
    if(updatedTeacher) {
        res.status(200).json(updatedTeacher)
    } else {
        next(new AppError("No se pudo actualizar el profesor", 400))
    }
})*/
exports.editTeacher = wrapAsync(async (req, res, next) => {
  try {
    // 1. Extraemos password para validar si la intención es cambiarla
    const { password, newPassword } = req.body;
    const isChangingPwd = !!(password && newPassword);

    // 2. Validamos si hay campos FCTM_ 
    const tieneCamposFCTM = Object.keys(req.body).some(key => key.startsWith("FCTM_"));

    // 3. Bloqueamos solo si NO hay campos FCTM Y NO se está intentando cambiar la contraseña
    if (!tieneCamposFCTM && !isChangingPwd) {
      return next(new AppError("No se ha proporcionado nada para actualizar (campos FCTM_ o Contraseña)", 400));
    }

    // 4. Llamada al servicio
    const updatedTeacher = await teacherService.update(req.params.id, req.body);

    if (!updatedTeacher) {
      return next(new AppError("No se encontró el profesor o no se pudo actualizar", 404));
    }

    res.status(200).json(updatedTeacher);

  } catch (error) {
    // Si el error ya es un AppError (lanzado desde el Service), lo pasamos tal cual
    if (error.isOperational || error.statusCode) {
      return next(error);
    }

    // Captura de errores específicos si el Service lanzó Error genérico
    if (error.message.includes('no es válido')) {
      return next(new AppError(error.message, 400));
    }

    // Error genérico de seguridad/servidor
    next(new AppError("Error al actualizar el profesor: " + error.message, 500));
  }
});
