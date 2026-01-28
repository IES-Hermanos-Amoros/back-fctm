const userManager = require("../models/userManager.model");

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
    });

    return student;
  } catch (error) {
    console.error("Error en userService.findById:", error);

    throw new Error("Error al recuperar el alumno de la base de datos");
  }
};

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
