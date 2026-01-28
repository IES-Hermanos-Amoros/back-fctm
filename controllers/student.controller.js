const userService = require('../services/student.service')

// Obtener todos los alumnos
exports.getAllStudents = async (req, res) => {
  try {
    const students = await userService.findAll()
    res.status(200).json(students)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Mostrar un alumno por ID
exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params
    const student = await userService.findById(id)

    if (!student) {
      return res.status(404).json({ message: 'Alumno no encontrado' })
    }

    res.status(200).json(student)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Actualizar campos específicos (FCTM_)
exports.updateStudentFctm = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const updatedUser = await userService.updateFctmFields(id, updateData)

    res.status(200).json({
      message: 'Campos FCTM actualizados correctamente',
      data: updatedUser,
    })
  } catch (error) {
    // Diferenciamos si el error es por falta de campos o por no encontrar al usuario
    const statusCode = error.message.includes('No se han proporcionado')
      ? 400
      : 404
    res.status(statusCode).json({ message: error.message })
  }
}
