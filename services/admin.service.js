const Admin = require('../models/userManager.model')

exports.getAllAdmins = async () =>
  await Admin.find({ SAO_profile: 'ADMINISTRADOR' })

exports.getAdminById = async id =>
  await Admin.findOne({ _id: id, SAO_profile: 'ADMINISTRADOR' })

exports.update = async (id, data) => {
  for (const campo in data) {
    if (Object.prototype.hasOwnProperty.call(data, campo)) {
      const regex = /^FCTM_/i
      if (!regex.test(campo)) {
        throw new Error(
          `El campo '${campo}' no es válido. Debe empezar por FCTM_`
        )
      }
    }
  }
  return await Admin.findOneAndUpdate(
    { _id: id, SAO_profile: 'ADMINISTRADOR' },
    data,
    { new: true }
  )
}
