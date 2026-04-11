const skillController = require("../controllers/skill.controller");
const { protect } = require("../middlewares/jwt.mw.js");
const { restrictTo } = require("../middlewares/profile.mw.js");
const express = require("express");
const router = express.Router();

// Ruta para el buscador (Debe ir antes de /:id para evitar conflictos)
// Ejemplo: /api/skills/search?q=javascript
router.get("/search", skillController.searchSkills);

// Obtener todas las aptitudes (Filtradas por verificadas en el servicio)
router.get("/", skillController.getAllVerifiedSkills);
// Obtener todas las aptitudes no verificadas (para admin)
router.get("/unverified",protect, restrictTo("ADMINISTRADOR","PROFESOR"), skillController.getAllNotVerifiedSkills);

// Actualización masiva de aptitudes
router.patch(
    "/bulk-verify", 
    protect, 
    restrictTo("ADMINISTRADOR","PROFESOR"), 
    skillController.bulkVerifySkills
);

// Obtener una aptitud específica por ID
router.get("/:id", skillController.getSkillById);

// Crear una nueva aptitud
router.post("/", skillController.createSkill);

router.post(
    "/ensure",
    protect,
    skillController.ensureSkills
);

// Editar una aptitud (Cambiado a patch para ser fiel a tu ejemplo)
router.patch("/:id", skillController.editSkillById);

// Eliminar una aptitud
router.delete("/:id", skillController.deleteSkillById);

module.exports = router;