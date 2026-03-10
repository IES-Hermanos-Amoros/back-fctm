import mongoose from "mongoose";

/**
 * Middleware específico para validar propiedad en campos tipo ARRAY de un documento
 *
 * @param {Model} Model - Modelo de Mongoose del recurso principal
 * @param {string} arrayField - Campo tipo array en el documento que contiene ObjectIds
 * @param {Array} allowedRoles - Roles que siempre pueden acceder
 * @param {string} paramName - Nombre del parámetro de la URL con el ID a verificar
 * @param {boolean} checkUserId - Si true, compara con el userId del token; si false, compara con el resourceId
 */
export const isOwnerArray = (
  Model,
  arrayField,
  allowedRoles = [],
  paramName = "id",
  checkUserId = true
) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramName];
      const userIdFromToken = req.user?.id;
      const userProfile = req.user?.profile;

      // 1️⃣ Validar ID
      if (!resourceId) {
        return res.status(400).json({ success: false, message: "ID requerido en la URL" });
      }

      if (!mongoose.Types.ObjectId.isValid(resourceId)) {
        return res.status(400).json({ success: false, message: "ID inválido" });
      }

      // 2️⃣ Buscar recurso principal
      const resource = await Model.findOne({ [arrayField]: { $in: [resourceId] } });

      if (!resource) {
        return res.status(404).json({ success: false, message: "Recurso no encontrado o no autorizado" });
      }

      // 3️⃣ Comprobar propiedad
      const arrayValues = resource[arrayField].map(id => id.toString());
      const isOwnerCheck = checkUserId
        ? arrayValues.includes(userIdFromToken)
        : arrayValues.includes(resourceId);

      const hasAllowedRole = allowedRoles.includes(userProfile);

      if (!isOwnerCheck && !hasAllowedRole) {
        return res.status(403).json({ success: false, message: "No autorizado" });
      }

      // 4️⃣ Adjuntar recurso al request
      req.resource = resource;

      next();

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error en middleware isOwnerArray",
        error: error.message
      });
    }
  };
};

/**
 router.get(
  "/:id",
  protect,
  isOwnerArray(UserManager, "FCTM_job_offers", ["ADMINISTRADOR", "PROFESOR"], "id", false),
  JobOfferController.findJobOfferById
);
 */