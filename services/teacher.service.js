// Listar y buscar por ID y editar campos FCTM_ de usuarios tipo Profesor
const UserManager = require("../models/userManager.model")

//Devolver todos los usuarios de tipo Profesor
exports.getAll = async () => await UserManager.find({ SAO_profile: "PROFESOR" })

//Devolver un profesor por ID (solo si es PROFESOR)
exports.getById = async (id) => await UserManager.findOne({ _id: id, SAO_profile: "PROFESOR" })

//Buscar profesor por usuario (solo si es PROFESOR)
exports.getByUser = async (user) => await UserManager.find({ usuario: user, SAO_profile: "PROFESOR" })

//Edita solo campos FCTM_ de un profesor existente
exports.update = async (id, datos) => {
   // Filtrar solo los campos que empiezan por FCTM_
   const camposFCTM = Object.keys(datos).filter(key => key.startsWith('FCTM_'))
   const datosFCTM = {}
   camposFCTM.forEach(key => { datosFCTM[key] = datos[key] })
   return await UserManager.findOneAndUpdate(
      { _id: id, SAO_profile: "PROFESOR" },
      { $set: datosFCTM },
      { new: true }
   )
}