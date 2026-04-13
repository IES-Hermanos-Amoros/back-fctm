const userManagerModel = require("../models/userManager.model")
const { compareLogin, hashPassword,validateStrongPassword } = require('../utils/bcrypt');
require("../models/categoryManager.model");

exports.getAll = async () => {
    return await userManagerModel.find({
        SAO_profile: "EMPRESA"
    })
    .populate({
                path: "FCTM_company_category",
                select: "_id FCTM_category_name" // Solo traemos lo necesario
            })
      .populate({
          path: "FCTM_skills",
          select: "_id FCTM_skill_name FCTM_skill_verified",
          match: { FCTM_skill_verified: true }
      })    
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
        }).populate({
                path: "FCTM_company_category",
                select: "_id FCTM_category_name" // Solo traemos lo necesario
            })
        .populate({
            path: "FCTM_skills",
            select: "_id FCTM_skill_name FCTM_skill_verified",
            match: { FCTM_skill_verified: true }
        })
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
  const { password, newPassword, ...otherData } = data;
  const filteredData = {};

  Object.keys(otherData).forEach((key) => {
    if (key.startsWith("FCTM_")) filteredData[key] = otherData[key];
  });

  const company = await userManagerModel.findById(id).select('+FCTM_password');
  if (!company) throw new Error("Empresa no encontrada");

  if (password && newPassword) {
    
    if (company.FCTM_password) {
      const isMatch = await compareLogin(password, student.FCTM_password);
      if (!isMatch) {
        throw new Error("La contraseña actual es incorrecta");
      }
    }

    if (!validateStrongPassword(newPassword)) {
      throw new Error('La nueva contraseña no cumple con los requisitos de seguridad');
    }
    
    company.FCTM_password = await hashPassword(newPassword);
  }

  Object.keys(filteredData).forEach((key) => {
    company[key] = filteredData[key];
  });

  return await company.save();
};