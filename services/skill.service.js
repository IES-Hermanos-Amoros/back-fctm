const skillModel = require("../models/skillManager.model");

// Devolver solo aptitudes verificadas (ordenadas alfabéticamente)
exports.getAll = async (getVerified) => {
  return await skillModel
    .find({ FCTM_skill_verified: getVerified })
    .sort({ createdAt: -1, FCTM_skill_usage_count: -1 });
};

// Devolver una aptitud por ID (independientemente de si está verificada o no)
exports.getById = async (id) => {
  return await skillModel.findById(id);
};

// Buscar solo entre las aptitudes verificadas
exports.searchByName = async (termino) => {
  return await skillModel
    .find({
      FCTM_skill_name: { $regex: termino, $options: "i" },
      FCTM_skill_verified: true, // Solo sugerimos las oficiales
    })
    .limit(10);
};

// Crear una nueva aptitud (por defecto FCTM_skill_verified será false según el modelo)
exports.create = async (datos) => {
  const newSkill = new skillModel(datos);
  return await newSkill.save();
};

// Edita una aptitud existente (útil para que un admin la verifique)
exports.update = async (id, datos) => {
  return await skillModel.findByIdAndUpdate(id, datos, {
    new: true,
    runValidators: true,
  });
};

// Elimina una aptitud
exports.delete = async (id) => {
  return await skillModel.findByIdAndDelete(id);
};

exports.searchExact = async (name) => {
  return await skillModel.findOne({
    FCTM_skill_name: name.toUpperCase().trim(),
  });
};

//BORRAR
// Actualización masiva de aptitudes
exports.bulkUpdate = async (ids, updates) => {
  return await skillModel.updateMany(
    { _id: { $in: ids } }, // Filtro: busca todos los documentos cuyo ID esté en la lista
    { $set: updates }, // Acción: aplica los cambios (en este caso, poner verified a true)
  );
};

// Eliminación masiva de aptitudes
exports.bulkDelete = async (ids) => {
  return await skillModel.deleteMany({ _id: { $in: ids } });
};
