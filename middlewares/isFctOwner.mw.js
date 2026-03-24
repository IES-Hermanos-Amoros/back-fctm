const fctManager = require("../models/fctManager.model");

exports.isFctOwner = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "No autenticado"
        });
      }

      const hasAllowedRole = allowedRoles.includes(user.profile);

      if (hasAllowedRole) return next();

      const fctId = req.params.id;

      const fct = await fctManager.findById(fctId);

      if (!fct) {
        return res.status(404).json({
          success: false,
          message: "FCT no encontrada"
        });
      }

      const isStudentOwner = fct.SAO_student_id === user.SAO_id;
      const isCompanyOwner = fct.SAO_company_id === user.SAO_id;

      if (!isStudentOwner && !isCompanyOwner) {
        return res.status(403).json({
          success: false,
          message: "No autorizado a esta FCT"
        });
      }

      next();

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error en middleware isFctOwner",
        error: error.message
      });
    }
  };
};