const DocumentManager = require("../models/documentManager.model");

//FCTM_visible_to_profiles: ["ADMINISTRADOR", "PROFESOR", "ALUMNO", "EMPRESA"]

const authorizeDocumentAccess = (action = "read") => {
  return async (req, res, next) => {
    try {
      const documentId = req.params.id;

      // Para rutas que no tienen :id (como GET /)
      if (!documentId) return next();

      const document = await DocumentManager.findById(documentId);

      if (!document) {
        return res.status(404).json({ message: "Documento no encontrado" });
      }

      const userProfile = req.user.profile;

      // 🔥 ADMINISTRADOR siempre puede todo
      if (userProfile === "ADMINISTRADOR") {
        return next();
      }

      // 🔥 Verificar si el perfil está autorizado
      if (!document.FCTM_visible_to_profiles.includes(userProfile)) {
        return res.status(403).json({
          message: "No tienes permisos para acceder a este documento"
        });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error de autorización" });
    }
  };
};

module.exports = authorizeDocumentAccess;

/*
Ejemplos de uso

router.get("/:id",
  protect,
  authorizeDocumentAccess("read"),
  documentController.getDocumentById
);

router.patch("/:id",
  protect,
  authorizeDocumentAccess("update"),
  documentController.editDocumentById
);

router.delete("/:id",
  protect,
  authorizeDocumentAccess("delete"),
  documentController.deleteDocumentById
);



TAREA PENDIENTE

Progeter el GET ALL y el UPLOAD

GET ALL (Filtrar los documentos por perfil de visibilidad). Algo similar a esto:

exports.getAllDocuments = async (req, res) => {
  try {
    const userProfile = req.user.profile;

    let query = {};

    if (userProfile !== "ADMINISTRADOR") {
      query = {
        FCTM_visible_to_profiles: userProfile
      };
    }

    const documents = await DocumentManager.find(query);

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo documentos" });
  }
};

PROTEGER UPLOAD (sólo ADMINISTRADOR podría subir un documento visible para todos, por ejemplo)

let visibleProfiles = req.body.FCTM_visible_to_profiles || [];

if (req.user.profile !== "ADMINISTRADOR") {
  // Si no es admin, solo puede crear documentos visibles a su propio perfil
  visibleProfiles = [req.user.profile];
}

*/