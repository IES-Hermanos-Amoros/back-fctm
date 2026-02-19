import mongoose from "mongoose";

export const isSelf = (req, res, next) => {
  try {
    const userIdFromToken = req.user?.id;
    const userRole = req.user?.profile;
    const userIdFromParams = req.params.id;

    // 1️⃣ Comprobar que venga ID en params
    if (!userIdFromParams) {
      return res.status(400).json({
        success: false,
        message: "ID requerido en la URL"
      });
    }

    // 2️⃣ Validar formato ObjectId
    if (!mongoose.Types.ObjectId.isValid(userIdFromParams)) {
      return res.status(400).json({
        success: false,
        message: "ID inválido"
      });
    }

    // 3️⃣ Comprobar que el token tenga ID
    if (!userIdFromToken) {
      return res.status(401).json({
        success: false,
        message: "Token inválido"
      });
    }

    // 4️⃣ Permitir si:
    // - es el propio usuario
    // - o es ADMIN
    if (
      userIdFromToken !== userIdFromParams &&
      userRole !== "ADMINISTRADOR"
    ) {
      return res.status(403).json({
        success: false,
        message: "No autorizado"
      });
    }

    // 🔥 Todo correcto
    next();

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error en middleware isSelf",
      error: error.message
    });
  }
};