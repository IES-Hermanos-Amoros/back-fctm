const Admin = require('../models/userManager.model')

exports.getAllAdmins = async () => await Admin.find({SAO_profile: 'ADMINISTRADOR'})


exports.getAdminById = async id => await Admin.findById(id)

exports.update = async (id, data) => {
  for (const campo in data) {
    if (Object.prototype.hasOwnProperty.call(data, campo)) {
      const regex = /^FCTM_/i
      if (!regex.test(campo)) {
        throw new Error(`El campo '${campo}' no es válido. Debe empezar por FCTM_`)
      }
    }
  }
  return await Admin.findByIdAndUpdate(id, data, { new: true })
}


