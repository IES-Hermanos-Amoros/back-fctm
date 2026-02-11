const fctManager = require("../models/fctManager.model");

// 1. Listar todas las FCTs 
exports.findAll = async () => {
  try {
    // .find({}) vacío para que traiga todos los registros
    const fcts = await fctManager.find({}).sort({ id: 1 });
    return fcts;
  } catch (error) {
    console.error("Error en fctService.findAll:", error);
    throw new Error("Error al recuperar todas las FCTs");
  }
};

// 2. Buscar por ID (Cualquier FCT)
exports.findById = async (id) => {
  try {
    const fct = await fctManager.findOne({ _id: id });
    return fct;
  } catch (error) {
    console.error("Error en fctService.findById:", error);
    throw new Error("Error al buscar la FCT en la base de datos");
  }
};

// 3. Editar SOLO campos FCTM_ 
// Bloquea cualquier intento de modificar campos que empiecen por SAO_
exports.updateFctmFields = async (id, data) => {
  try {
    const filteredData = {};

    // Filtro estricto: Solo pasan los campos que empiezan por FCTM_
    Object.keys(data).forEach((key) => {
      if (key.startsWith("FCTM_")) {
        filteredData[key] = data[key];
      }
    });

    if (Object.keys(filteredData).length === 0) {
      throw new Error("No se han enviado campos FCTM_ válidos para editar");
    }

    // Actualización segura
    const updatedFct = await fctManager.findOneAndUpdate(
      { _id: id },
      { $set: filteredData },
      { new: true, runValidators: true }
    );

    if (!updatedFct) throw new Error("FCT no encontrada");

    return updatedFct;
  } catch (error) {
    console.error("Error en fctService.updateFctmFields:", error);
    throw error;
  }
};