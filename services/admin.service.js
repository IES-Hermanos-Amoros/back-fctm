const Admin = require('../models/userManager.model')

exports.getAllAdmins = async () => {
  if (Admin.SAO_profile == 'ADMINISTRADOR') {
    return await Admin.find()
  } else {
    return await json({
      message: 'No tiene permisos para acceder a esta información',
    })
  }
}

exports.getAdminById = async id => await Admin.findById(id)

exports.update = async (id, data) => {
  if (Admin.SAO_profile == 'ADMINISTRADOR') {
    for (const campo in data) {
      if (dato.hasOwnProperty(campo) && typeof data[campo] === 'string') {
        const regex = new RegExp(`^${'FCTM_'}`, 'i')
        if (!regex.test(data[campo])) {
          console.log('Los campos deben empezar por FCTM_')
          return await json({ message: 'Los campos deben empezar por FCTM_' })
        }
      }
      return await Admin.findByIdAndUpdate(id, data)
    }
  } else {
    return await json({
      message: 'No tiene permisos para acceder a esta información',
    })
  }
}
