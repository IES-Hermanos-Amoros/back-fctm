const userManager = require("../models/userManager.model");
const { compareLogin, hashPassword,validateStrongPassword } = require('../utils/bcrypt');


exports.findAll = async () => {
  try {
    const students = await userManager
      .find({ SAO_profile: "ALUMNO" })
      .populate({
                path: "FCTM_company_category",
                select: "_id FCTM_category_name" // Solo traemos lo necesario
            })
        .populate({
            path: "FCTM_skills",
            select: "_id FCTM_skill_name FCTM_skill_verified",
            match: { FCTM_skill_verified: true }
        })
      .sort({ SAO_name: 1 });

    return students;
  } catch (error) {
    console.error("Error en userService.findAll:", error);

    throw new Error("Error al recuperar los alumnos de la base de datos");
  }
};

exports.findById = async (id) => {
  try {
    const student = await userManager.findOne({
      _id: id,
      SAO_profile: "ALUMNO",
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
    .populate({
      path: 'FCTM_documents',
      select: 'FCTM_document_name FCTM_document_type FCTM_document_url FCTM_inserted_date',
      options: { sort: { FCTM_inserted_date: -1 } }
    });

    console.log("Alumno encontrado:", student);

    return student;
  } catch (error) {
    console.error("Error en userService.findById:", error);

    throw new Error("Error al recuperar el alumno de la base de datos");
  }
};

exports.bulkUpdateSkills = async (ids, skills) => {
  try {
    const result = await userManager.updateMany(
      { _id: { $in: ids } },
      { $addToSet: { FCTM_skills: { $each: skills } } }
    );
    return result;
  } catch (error) {
    console.error("Error en userService.bulkUpdateSkills:", error);
    throw error;
  }
};

/*
exports.updateFctmFields = async (id, data) => {
  try {
    const filteredData = {};

    Object.keys(data).forEach((key) => {
      if (key.startsWith("FCTM_")) filteredData[key] = data[key];
    });

    if (Object.keys(filteredData).length === 0)
      throw new Error(
        "No se han proporcionado campos válidos (FCTM_) para actualizar"
      );

    const updatedUser = await userManager.findOneAndUpdate(
      { _id: id },
      { $set: filteredData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) throw new Error("Usuario no encontrado");

    return updatedUser;
  } catch (error) {
    console.error("Error en userService.updateFctmFields:", error);

    throw error;
  }
};
*/

exports.updateFctmFields = async (id, data) => {
  try {
    const { password, newPassword, ...otherData } = data;
    const filteredData = {};

    Object.keys(otherData).forEach((key) => {
      if (key.startsWith("FCTM_")) filteredData[key] = otherData[key];
    });

    // 1. Forzamos la selección de FCTM_password
    const student = await userManager.findById(id).select('+FCTM_password');
    if (!student) throw new Error("Usuario no encontrado");

    // 2. Lógica de cambio de contraseña
    if (password && newPassword) {
      
      // SEGURIDAD: Si el usuario NO tiene contraseña aún (es null), 
      // saltamos la comparación y dejamos que ponga una nueva.
      if (student.FCTM_password) {
        const isMatch = await compareLogin(password, student.FCTM_password);
        if (!isMatch) {
          throw new Error("La contraseña actual es incorrecta");
        }
      }

      if (!validateStrongPassword(newPassword)) {
        throw new Error('La nueva contraseña no cumple con los requisitos de seguridad');
      }
      
      // Hasheamos y guardamos en el campo correcto
      student.FCTM_password = await hashPassword(newPassword);
    }

    // 3. Actualizamos el resto de campos FCTM_
    Object.keys(filteredData).forEach((key) => {
      student[key] = filteredData[key];
    });

    // 7. Guardar cambios
    const updatedStudent = await student.save();

    // 8. Retornar con populate de skills verificados (igual que Dummy)
    return await userManager.findById(updatedStudent._id)
      .populate({
        path: "FCTM_company_category",
        select: "_id FCTM_category_name"
      })
      .populate({
        path: "FCTM_skills",
        select: "_id FCTM_skill_name FCTM_skill_verified",
        match: { FCTM_skill_verified: true }
      })
      .populate({
        path: 'FCTM_documents',
        select: 'FCTM_document_name FCTM_document_type FCTM_document_url FCTM_inserted_date',
        options: { sort: { FCTM_inserted_date: -1 } }
      });

  } catch (error) {
    console.error("Error en userService.updateFctmFields:", error);
    throw error;
  }
};