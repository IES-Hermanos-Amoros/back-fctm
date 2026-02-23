import mongoose from "mongoose";

export const isOwner = (
  Model,
  ownerField,
  allowedRoles = [],
  paramName = "id"
) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramName];
      const userIdFromToken = req.user?.id;
      const userProfile = req.user?.profile;

      // 1️⃣ Validar ID en params
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: "ID requerido en la URL"
        });
      }

      if (!mongoose.Types.ObjectId.isValid(resourceId)) {
        return res.status(400).json({
          success: false,
          message: "ID inválido"
        });
      }

      // 2️⃣ Buscar recurso
      const resource = await Model.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: "Recurso no encontrado"
        });
      }

      // 3️⃣ Comprobar propietario
      const ownerId = resource[ownerField]?.toString();
      const isOwner = ownerId === userIdFromToken;
      const hasAllowedRole = allowedRoles.includes(userProfile);

      if (!isOwner && !hasAllowedRole) {
        return res.status(403).json({
          success: false,
          message: "No autorizado"
        });
      }

      // 4️⃣ Adjuntar recurso al request para evitar doble query
      req.resource = resource;

      next();

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error en middleware isOwner",
        error: error.message
      });
    }
  };
};


//Ejemplo de uso desde una ruta
//import { isOwner } from "../middlewares/isOwner.mw.js";
//import ReviewManager from "../models/reviewManager.model.js";

//Para acceder a esta ruta, debes estar logueado y ser el propietario (quién creó, FCTM_user_id) la reseña o ser ADMIN o PROFESOR
/*router.get(
  "/:id",
  protect,
  isOwner(ReviewManager, "FCTM_user_id", ["ADMINISTRADOR", "PROFESOR"]),
  getReviewById
);*/