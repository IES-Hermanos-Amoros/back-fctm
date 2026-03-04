const skillController = require("../controllers/skill.controller");
const express = require("express");
const router = express.Router();

// Ruta para el buscador (Debe ir antes de /:id para evitar conflictos)
// Ejemplo: /api/skills/search?q=javascript
router.get("/search", skillController.searchSkills);

// Obtener todas las aptitudes (Filtradas por verificadas en el servicio)
router.get("/", skillController.getAllSkills);

// Obtener una aptitud específica por ID
router.get("/:id", skillController.getSkillById);

// Crear una nueva aptitud
router.post("/", skillController.createSkill);

// Editar una aptitud (Cambiado a patch para ser fiel a tu ejemplo)
router.patch("/:id", skillController.editSkillById);

// Eliminar una aptitud
router.delete("/:id", skillController.deleteSkillById);

module.exports = router;