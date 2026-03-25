const Admin = require('../models/userManager.model')
const { compareLogin, hashPassword,validateStrongPassword } = require('../utils/bcrypt')
const AppError = require('../utils/AppError')

exports.getAllAdmins = async () => await Admin.find({SAO_profile: 'ADMINISTRADOR'})


exports.getAdminById = async id =>
  await Admin.findOne({ _id: id, SAO_profile: 'ADMINISTRADOR' })
  .populate({
    path: "FCTM_documents",
    match: { FCTM_document_type: "AVATAR" },
    options: {
      sort: { FCTM_inserted_date: -1 },
      limit: 1
    },
    select: "FCTM_document_url"
  });



exports.update = async (id, data) => {
  const { password, newPassword, ...otherData } = data;

  // 2. Validación de prefijos (Cambiamos a AppError para que el controller lo detecte)
  for (const campo in otherData) {
    if (Object.prototype.hasOwnProperty.call(otherData, campo)) {
      if (!/^FCTM_/i.test(campo)) {
        throw new AppError(`El campo '${campo}' no es válido. Debe empezar por FCTM_`, 400);
      }
    }
  }

  // 3. Búsqueda
  const admin = await Admin.findOne({ _id: id, SAO_profile: 'ADMINISTRADOR' }).select('+FCTM_password');
  if (!admin) throw new AppError('Administrador no encontrado', 404);

  // 4. Lógica de contraseña (Ya usas AppError aquí, perfecto)
  if (password && newPassword) {
    const isMatch = await compareLogin(password, admin.FCTM_password);
    if (!isMatch) throw new AppError('La contraseña actual es incorrecta', 400);
    
    if(!validateStrongPassword(newPassword)){
      throw new AppError('La nueva contraseña no cumple con los requisitos de seguridad', 400);
    }
    admin.FCTM_password = await hashPassword(newPassword);
  }

  // 5. Asignación
  Object.keys(otherData).forEach((key) => {
    admin[key] = otherData[key];
  });

  // 6. Guardado
  return await admin.save();
};