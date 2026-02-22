import mongoose from "mongoose";

export const isSelf = (
  allowedRoles = [],
  paramName = "id"
) => {
  return (req, res, next) => {
    try {
      const userIdFromToken = req.user?.id;
      const userProfile = req.user?.profile;
      const userIdFromParams = req.params[paramName];

      // 1️⃣ Comprobar ID en params
      if (!userIdFromParams) {
        return res.status(400).json({
          success: false,
          message: "ID requerido en la URL"
        });
      }

      // 2️⃣ Validar ObjectId
      if (!mongoose.Types.ObjectId.isValid(userIdFromParams)) {
        return res.status(400).json({
          success: false,
          message: "ID inválido"
        });
      }

      // 3️⃣ Validar token
      if (!userIdFromToken) {
        return res.status(401).json({
          success: false,
          message: "Token inválido"
        });
      }

      // 4️⃣ Comprobación
      const isSelfUser = userIdFromToken === userIdFromParams;
      const hasAllowedRole = allowedRoles.includes(userProfile);

      if (!isSelfUser && !hasAllowedRole) {
        return res.status(403).json({
          success: false,
          message: "No autorizado"
        });
      }

      next();

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error en middleware isSelf",
        error: error.message
      });
    }
  };
};


//Accesos si es algún rol permitido (como ADMIN, TEACHER...) o si es uno mismo 
//Ejemplo: Al perfil del usuario de alumno (Show) pueden acceder admin, teachers, companies, pero sólo el propio alumno
/*
router.get(
  "/:id",
  protect,
  isSelf(["ADMINISTRADOR","TEACHER","COMPANY"]),
  getUserById
);
*/