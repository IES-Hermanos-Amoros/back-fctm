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
            path: "FCTM_actions",
            select: "FCTM_action_title FCTM_action_type FCTM_action_datetime FCTM_action_notes FCTM_inserted_date FCTM_documents FCTM_created_by",
            options: { sort: { FCTM_action_datetime: -1 } },
            // 🔥 NUEVO: Sub-populate para resolver el creador de la acción
            populate: {
                path: "FCTM_created_by",
                model: "UserManager", // Forzamos el modelo por si acaso
                select: "SAO_name SAO_profile SAO_email" // Traemos solo lo necesario para el frontend
            }
        }).populate({
          path: "FCTM_documents",
          select: "_id FCTM_document_name FCTM_document_url FCTM_document_type FCTM_inserted_date",
          options: {
            sort: { FCTM_inserted_date: -1 },
          }
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

exports.bulkUpdateSkills = async (ids, skills) => {
  try {
    const result = await userManagerModel.updateMany(
      { _id: { $in: ids }, SAO_profile: "EMPRESA" },
      { $addToSet: { FCTM_skills: { $each: skills } } }
    );
    return result;
  } catch (error) {
    console.error("Error en companyService.bulkUpdateSkills:", error);
    throw error;
  }
};

exports.bulkUpdateCategories = async (ids, categories) => {
  try {
    const result = await userManagerModel.updateMany(
      { _id: { $in: ids }, SAO_profile: "EMPRESA" },
      { $addToSet: { FCTM_company_category: { $each: categories } } }
    );
    return result;
  } catch (error) {
    console.error("Error en companyService.bulkUpdateCategories:", error);
    throw error;
  }
};

exports.update = async (id, data) => {
  const { password, newPassword, ...otherData } = data;
  const filteredData = {};

  Object.keys(otherData).forEach((key) => {
    if (key.startsWith("FCTM_")) filteredData[key] = otherData[key];
  });

  const company = await userManagerModel.findById(id).select('+FCTM_password');
  if (!company) throw new Error("Empresa no encontrada");

  if (password && newPassword) {
      // Cambiamos 'student' por 'company'
      if (company.FCTM_password) {
        const isMatch = await compareLogin(password, company.FCTM_password); 
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
