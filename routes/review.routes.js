const reviewController = require("../controllers/review.controller")
const express = require("express")
const router = express.Router()

router.get("/", reviewController.getAllReviews)

router.get("/:id", reviewController.getReviewById)

router.post("/", reviewController.createReview)

router.patch("/:id", reviewController.editReviewById)

router.delete("/:id", reviewController.deleteReviewById)

module.exports = router
