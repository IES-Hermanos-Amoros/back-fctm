const reviewService = require("../services/review.service");
const { wrapAsync } = require("../utils/functions");
const AppError = require("../utils/appError");

exports.getAllVerifiedReviews = wrapAsync(async (req, res, next) => {
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

exports.createReview = wrapAsync(async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return next(new AppError("Usuario no autenticado", 401));
    }
    
    if (!req.user.profile) {
      return next(new AppError("Usuario sin perfil válido", 401));
    }
    
    const reviewData = {
      ...req.body,
      FCTM_user_id: req.user.id
    };
    const review = await reviewService.create(reviewData);
    res.status(201).json({ review, message: "Reseña creada correctamente. Pendiente de verificación." });
  } catch (error) {
    next(new AppError("Error al crear la reseña: " + error.message, 500));
  }
});

exports.editReviewById = wrapAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = req.body;
    const review = await reviewService.update(id, comment);
    if (!review) {
      next(new AppError("No se encontró la reseña", 404));
    }

    res
      .status(200)
      .json({ review, message: "Reseña actualizada correctamente." });
  } catch (error) {
    next(new AppError("Error al actualizar la reseña", 500));
  }
});

exports.deleteReviewById = wrapAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await reviewService.delete(id);
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
