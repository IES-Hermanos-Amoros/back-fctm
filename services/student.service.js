const userManager = require("../models/userManager.model");
const { compareLogin, hashPassword,validateStrongPassword } = require('../utils/bcrypt');


exports.findAll = async () => {
  try {
    const students = await userManager
      .find({ SAO_profile: "ALUMNO" })
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
    // 1. Extraemos contraseñas y el resto de datos
    const { password, newPassword, ...otherData } = data;
    const filteredData = {};

    // 2. Filtrar solo los campos que empiezan por FCTM_
    Object.keys(otherData).forEach((key) => {
      if (key.startsWith("FCTM_")) filteredData[key] = otherData[key];
    });

    // 3. Buscamos al estudiante (userManager) incluyendo el campo password
    // Nota: Si quieres asegurar que sea perfil estudiante, añade: { _id: id, SAO_profile: 'STUDENT' }
    const student = await userManager.findById(id).select('+FCTM_password');
    if (!student) throw new Error("Usuario no encontrado");

    // 4. Lógica de cambio de contraseña
    if (password && newPassword) {
      const isMatch = await compareLogin(password, student.FCTM_password);
      if (!isMatch) {
        throw new Error("La contraseña actual es incorrecta");
      }
      if(!validateStrongPassword(newPassword)){
        throw new Error('La nueva contraseña no cumple con los requisitos de seguridad');
      }
      student.password = await hashPassword(newPassword);
    }

    // 5. Verificar si hay algo que actualizar (campos FCTM o Password)
    const hasFctmFields = Object.keys(filteredData).length > 0;
    const isChangingPwd = !!(password && newPassword);

    if (!hasFctmFields && !isChangingPwd) {
      throw new Error("No se han proporcionado datos para actualizar");
    }

    // 6. Asignar los campos filtrados al objeto del estudiante
    Object.keys(filteredData).forEach((key) => {
      student[key] = filteredData[key];
    });

    // 7. Guardar cambios. .save() devuelve el usuario actualizado
    return await student.save();

  } catch (error) {
    console.error("Error en userService.updateFctmFields:", error);
    throw error;
  }
};