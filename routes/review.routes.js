const reviewController = require("../controllers/review.controller");
const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/jwt.mw.js");
const { restrictTo } = require("../middlewares/profile.mw.js");
const { isOwner } = require("../middlewares/isOwner.mw.js");
const ReviewManager = require("../models/reviewManager.model.js");
const { ro } = require("date-fns/locale");

router.get(
  "/",
  protect,
  restrictTo("ADMINISTRADOR", "PROFESOR", "ALUMNO"),
  reviewController.getAllVerifiedReviews,
);

router.get(
  "/unverified",
  protect,
  restrictTo("ADMINISTRADOR","PROFESOR"),
  reviewController.getAllNotVerifiedReviews,
);

router.get(
  "/reviews",
  protect,
  restrictTo("ADMINISTRADOR", "PROFESOR"),
  reviewController.getGlobalReviewsList
);

router.patch(
  "/bulk-update",
  protect,
  restrictTo("ADMINISTRADOR", "PROFESOR"),
  reviewController.bulkValidateReviews
)

router.delete(
  "/all-delete",
  protect,
  restrictTo("ADMINISTRADOR", "PROFESOR"),
  reviewController.allDeleteReviews
)

//Logueado y ser admin, teacher o student (el que creó la reseña... el owner)
router.get(
  "/:id",
  protect,
  isOwner(ReviewManager, "FCTM_user_id", ["ADMINISTRADOR", "PROFESOR"]),
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
