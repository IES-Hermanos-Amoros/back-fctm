const userManagerModel = require("../models/userManager.model")
const { compareLogin, hashPassword,validateStrongPassword } = require('../utils/bcrypt');
require("../models/categoryManager.model");

exports.getAll = async () => {
    return await userManagerModel.find({
        SAO_profile: "EMPRESA"
    })
    .populate("FCTM_company_category", "FCTM_category_name")
}

exports.getById = async (id) => {
    return await userManagerModel.findById(id)
        .populate({
            path: "FCTM_job_offers",
            // Seleccionamos los campos exactos que necesita tu tabla en el frontend
            select: "FCTM_job_title FCTM_job_start_date FCTM_job_end_date FCTM_job_status FCTM_inserted_date",
            options: { sort: { FCTM_inserted_date: -1 } }
        }).populate({
          path: "FCTM_documents",
          match: { FCTM_document_type: "AVATAR" },
          options: {
            sort: { FCTM_inserted_date: -1 },
            limit: 1
          },
          select: "FCTM_document_url"
        });
}

/*
exports.update = async (id,datos) => {
    console.log({
        id, datos
    })
    const keys = Object.keys(datos)

    const tieneSAO = keys.some(key => key.startsWith("SAO_"))
    if(tieneSAO){
        return "ERR_SAO"
    }

    const updateFields = {}
    keys.forEach(key => {
        if(key.startsWith("FCTM_")) {
            updateFields[key] = datos[key]
        }
    })

    if(Object.keys(updateFields).length === 0){
        return null
    }

    return await userManagerModel.findByIdAndUpdate(id, updateFields, { new:true })
}*/

exports.update = async (id, datos) => {
  // 1. Extraemos contraseñas y el resto
  const { password, newPassword, ...otherData } = datos;
  const keys = Object.keys(otherData);

  // 2. Validación de seguridad: Bloquear cualquier campo que empiece por SAO_
  const tieneSAO = keys.some(key => key.startsWith("SAO_"));
  if (tieneSAO) {
    return "ERR_SAO";
  }

  // 3. Buscamos la empresa (userManagerModel) con el hash de la contraseña
  // Nota: Asegúrate de filtrar por el perfil adecuado si es necesario
  const company = await userManagerModel.findById(id).select('+FCTM_password');

  if (!company) {
    return null; // O throw new Error('Empresa no encontrada') según prefieras
  }

  // 4. Lógica de cambio de contraseña
  if (password && newPassword) {
    const isMatch = await compareLogin(password, company.FCTM_password);
    if (!isMatch) {
      // Puedes retornar un código de error específico o lanzar una excepción
      throw new Error('La contraseña actual es incorrecta');
    }
    if(!validateStrongPassword(newPassword)){
      throw new Error('La nueva contraseña no cumple con los requisitos de seguridad');
    }
    company.password = await hashPassword(newPassword);
  }

  // 5. Mapeo de campos permitidos (solo los que empiezan por FCTM_)
  keys.forEach(key => {
    if (key.startsWith("FCTM_")) {
      company[key] = otherData[key];
    }
  });

  // 6. Guardamos los cambios usando .save()
  // Esto devuelve el documento actualizado
  return await company.save();
};