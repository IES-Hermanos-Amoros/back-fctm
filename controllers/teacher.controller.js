const teacherService = require('../services/teacher.service')

exports.findAllTeachers = async (req, res) => {
  try {
    const teachers = await teacherService.findAllTeachers()
    res.render("teachers/list", { teachers })
  } catch (error) {
    res.status(500).send(error.message)
  }
}

exports.findTeacherById = async (req, res) => {
  try {
    const teacher = await teacherService.findTeacherById(req.params.id)
    if (!teacher) {
      return res.status(404).send('Profesor no encontrado')
    }
    res.render("teachers/detail", { teacher })
  } catch (error) {
    res.status(500).send(error.message)
  }
}

exports.editTeacher = async (req, res) => {
    try {
        const teacher = await teacherService.updateTeacher(req.params.id, req.body)
        if (!teacher) {
            return res.status(404).send('Profesor no encontrado')
        }
        res.redirect(`/teachers/${teacher.id}`)
    } catch (error) {
        res.status(500).send(error.message)
    }
}


 
   