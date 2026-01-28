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
})
