const reviewController = require("../controllers/review.controller");
const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/jwt.mw.js");
const { restrictTo } = require("../middlewares/profile.mw.js");
const { isOwner } = require("../middlewares/isOwner.mw.js");
const ReviewManager = require("../models/reviewManager.model.js");

router.get(
  "/",
  protect,
  restrictTo("ADMINISTRADOR", "PROFESOR", "ALUMNO"),
  reviewController.getAllReviews,
);

router.get(
  "/:id",
  protect,
  restrictTo("ADMINISTRADOR", "PROFESOR", "ALUMNO"),
  reviewController.getReviewById,
);

router.post(
  "/",
  protect,
  restrictTo("ADMINISTRADOR", "PROFESOR", "ALUMNO"),
  reviewController.createReview,
);

//Logueado y ser admin, teacher o student (el que creó la reseña... el owner)
router.patch(
  "/:id",
  protect,
  isOwner(ReviewManager, "FCTM_user_id", ["ADMINISTRADOR", "PROFESOR"]),
  reviewController.editReviewById,
);

//Logueado y ser admin, teacher o student (el que creó la reseña... el owner)
router.delete(
  "/:id",
  protect,
  isOwner(ReviewManager, "FCTM_user_id", ["ADMINISTRADOR", "PROFESOR"]),
  reviewController.deleteReviewById,
);

module.exports = router;
