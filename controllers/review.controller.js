const reviewService = require('../services/review.service')
const { wrapAsync } = require('../utils/functions')
const AppError = require('../utils/AppError')
const ReviewManager = require("../models/reviewManager.model.js");

exports.getAllVerifiedReviews = wrapAsync(async (req,res,next) => {
  try {
    const reviews = await reviewService.getAll(true);
    res.status(200).json(reviews);
  } catch (error) {
    next(new AppError("Error al obtener todas las reseñas", 500));
  }
});

exports.getAllNotVerifiedReviews = wrapAsync(async (req, res, next) => {
  try {
    const reviews = await reviewService.getAll(false);
    res.status(200).json(reviews);
  } catch (error) {
    next(new AppError("Error al obtener todas las reseñas", 500));
  }
});

exports.getReviewById = wrapAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await reviewService.getById(id);

    if (!review) {
      next(new AppError("No se encontró la reseña", 404));
    }

    return res.status(200).json(review);
  } catch (error) {
    next(new AppError("Error al obtener la reseña", 500));
  }
});

exports.createReview = async (req,res,next) => {
  try {
    console.log("=== CREATE REVIEW ===")
    console.log("req.body:", req.body)
    const review = await reviewService.create(req.body)
    res.status(201).json({ review, message: 'Reseña creada correctamente.' })
  } catch (error) {
    console.error("Error real:", error.message)
    console.error("Stack:", error.stack)
    next(new AppError("Error al crear la reseña: " + error.message, 500))
  }
}

exports.editReviewById = wrapAsync(async (req,res,next) => {
  try {
    const { id } = req.params;
    const datosActualizados = {
      ...req.body,
      FCTM_review_verified: false //forzando el verified a false
    }
    //const comment = req.body;
    const review = await reviewService.update(id, datosActualizados);
    if (!review) {
      return next(new AppError("No se encontró la reseña", 404));
    }

    res
      .status(200)
      .json({ review, message: "Reseña actualizada correctamente." });
  } catch (error) {
    next(new AppError("Error al actualizar la reseña", 500));
  }
});

exports.bulkValidateReviews = wrapAsync(async (req, res, next) => {
  const { ids } = req.body; 

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Se requiere un array de IDs' });
  }

  try {
    const result = await reviewService.bulkUpdate(ids);
      
    res.status(200).json({ 
      success: true, 
      message: `${result.modifiedCount} reseñas validadas correctamente` 
    });
    
  } catch (error) {
    console.error("Error en updateMany:", error);
    res.status(500).json({ error: 'Error en la actualización masiva: ' + error.message });
  }
});

exports.allDeleteReviews = wrapAsync(async (req, res, next) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Se requiere un array de IDs' });
  }

  try {
    const result = await reviewService.allDelete(ids);

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} reseñas eliminadas correctamente`
    });

  } catch (error) {
    console.error("Error en allDelete:", error);
    res.status(500).json({ error: 'Error en el eliminado masivo: ' + error.message });
  }
});

exports.deleteReviewById = wrapAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    //ERROR
    const { fctId } = req.query
    const review = await reviewService.delete(id,fctId);
    if (!review) {
      next(new AppError("No se encontró la reseña", 404));
    }

    res
      .status(200)
      .json({ review, message: "Reseña eliminada correctamente." });
  } catch (error) {
    next(new AppError("Error al eliminar la reseña", 500));
  }
});

// Obtener el listado global de reseñas cruzando datos (Empresa y Alumno)
exports.getGlobalReviewsList = wrapAsync(async (req, res, next) => {
  try {
    const reviews = await reviewService.getGlobalReviews();
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(new AppError("Error al sacar el listado global de reseñas", 500));
  }
});