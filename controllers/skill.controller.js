const skillService = require("../services/skill.service");
const { wrapAsync } = require("../utils/functions");
const AppError = require("../utils/AppError"); // Asumiendo que esta es la ruta de tu clase AppError

exports.getAllVerifiedSkills = wrapAsync(async (req, res, next) => {
  try {
    const skills = await skillService.getAll(true);
    res.status(200).json(skills);
  } catch (error) {
    next(new AppError("Error al obtener todas las aptitudes", 500));
  }
});

exports.getAllNotVerifiedSkills = wrapAsync(async (req, res, next) => {
  try {
    const skills = await skillService.getAll(false);
    res.status(200).json(skills);
  } catch (error) {
    next(new AppError("Error al obtener todas las aptitudes", 500));
  }
});

exports.getSkillById = wrapAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    const skill = await skillService.getById(id);

    if (!skill) {
      return next(new AppError("No se encontró la aptitud", 404));
    }

    res.status(200).json(skill);
  } catch (error) {
    next(new AppError("Error al obtener la aptitud", 500));
  }
});

exports.searchSkills = wrapAsync(async (req, res, next) => {
  try {
    const { q } = req.query;
    const skills = await skillService.searchByName(q || "");
    res.status(200).json(skills);
  } catch (error) {
    next(new AppError("Error en la búsqueda de aptitudes", 500));
  }
});

exports.createSkill = wrapAsync(async (req, res, next) => {
  try {
    const skill = await skillService.create(req.body);
    res.status(201).json({ skill, message: "Aptitud creada correctamente." });
  } catch (error) {
    // Manejo específico para duplicados (Unique constraint)
    if (error.code === 11000) {
      return next(new AppError("Esta aptitud ya existe en el sistema", 400));
    }
    next(new AppError("Error al crear la aptitud", 500));
  }
});

exports.editSkillById = wrapAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    const datos = req.body;
    const skill = await skillService.update(id, datos);

    if (!skill) {
      return next(new AppError("No se encontró la aptitud", 404));
    }

    res
      .status(200)
      .json({ skill, message: "Aptitud actualizada correctamente." });
  } catch (error) {
    next(new AppError("Error al actualizar la aptitud", 500));
  }
});

exports.deleteSkillById = wrapAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    const skill = await skillService.delete(id);

    if (!skill) {
      return next(new AppError("No se encontró la aptitud", 404));
    }

    res
      .status(200)
      .json({ skill, message: "Aptitud eliminada correctamente." });
  } catch (error) {
    next(new AppError("Error al eliminar la aptitud", 500));
  }
});

exports.ensureSkills = wrapAsync(async (req, res, next) => {
  const { names } = req.body;
  const ids = [];

  for (const name of names) {
    let skill = await skillService.searchExact(name);
    if (!skill) {
      skill = await skillService.create({
        FCTM_skill_name: name,
        FCTM_skill_verified: false,
        FCTM_skill_usage_count: 1,
        FCTM_skill_created_by: req.user.id,
      });
    } else {
      skill.FCTM_skill_usage_count = (skill.FCTM_skill_usage_count || 0) + 1;
      await skill.save();
    }
    ids.push(skill._id);
  }
  res.json({
    success: true,
    data: ids,
  });
});

//BORRAR
exports.bulkVerifySkills = wrapAsync(async (req, res, next) => {
  try {
    const { ids, updates } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return next(new AppError("No se proporcionaron IDs para validar", 400));
    }

    // Llamamos a un método del service
    const result = await skillService.bulkUpdate(ids, updates);

    res.status(200).json({
      success: true,
      message: "Aptitudes validadas correctamente.",
      data: result,
    });
  } catch (error) {
    next(new AppError("Error al realizar la validación masiva", 500));
  }
});

exports.bulkDeleteSkills = wrapAsync(async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return next(new AppError("No se proporcionaron IDs para eliminar", 400));
    }

    const result = await skillService.bulkDelete(ids);

    res.status(200).json({
      success: true,
      message: "Aptitudes eliminadas correctamente.",
      data: result,
    });
  } catch (error) {
    next(new AppError("Error al eliminar las aptitudes", 500));
  }
});
