const UserManager = require("../models/userManager.model")
const AppError = require("../utils/AppError");
const { compareLogin, hashPassword,validateStrongPassword } = require('../utils/bcrypt');


//Devolver todos los usuarios de tipo Profesor
exports.getAll = async () => await UserManager.find({ SAO_profile: "PROFESOR" })

//Devolver un profesor por ID (solo si es PROFESOR)
//exports.getById = async (id) => await UserManager.findOne({ _id: id, SAO_profile: "PROFESOR" })
exports.getById = async (id) => {
  return await UserManager.findOne({
    _id: id,
    SAO_profile: "PROFESOR"
  }).populate({
    path: "FCTM_documents",
    match: { FCTM_document_type: "AVATAR" },
    options: {
      sort: { FCTM_inserted_date: -1 },
      limit: 1
    },
    select: "FCTM_document_url"
  });
};

//Edita solo campos FCTM_ de un profesor existente
/*exports.update = async (id, datos) => {
   // Filtrar solo los campos que empiezan por FCTM_
   const camposFCTM = Object.keys(datos).filter(key => key.startsWith('FCTM_'))
   const datosFCTM = {}
   camposFCTM.forEach(key => { datosFCTM[key] = datos[key] })
   return await UserManager.findOneAndUpdate(
      { _id: id, SAO_profile: "PROFESOR" },
      { $set: datosFCTM },
      { new: true }
   )
}*/
exports.update = async (id, datos) => {
  // 1. Extraemos las contraseñas para que no entren en el filtro de campos FCTM_
  const { password, newPassword, ...otherData } = datos;

  // 2. Buscamos al profesor incluyendo el campo password
  const teacher = await UserManager.findOne({ 
    _id: id, 
    SAO_profile: "PROFESOR" 
  }).select('+FCTM_password');

  if (!teacher) {
      throw new AppError('Profesor no encontrado', 404);
  }

  // 3. Lógica de cambio de contraseña segura
  if (password && newPassword) {
    const isMatch = await compareLogin(password, teacher.FCTM_password);
    if (!isMatch) {
      throw new AppError('La contraseña actual es incorrecta', 400);
    }
    if(!validateStrongPassword(newPassword)){
      throw new AppError('La nueva contraseña no cumple con los requisitos de seguridad', 400);
    }
    //ERROR
    //teacher.password = await hashPassword(newPassword);
    teacher.FCTM_password = await hashPassword(newPassword);
  }

  // 4. Filtrar y asignar solo los campos que empiezan por FCTM_
  const camposFCTM = Object.keys(otherData).filter(key => key.startsWith('FCTM_'));
  
  camposFCTM.forEach(key => { 
    teacher[key] = otherData[key]; 
  });

  // 5. Guardamos con .save() para persistir tanto la nueva password como los campos FCTM_
  return await teacher.save();
};