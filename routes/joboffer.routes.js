const jobOfferController = require("../controllers/joboffer.controller")
const express = require("express")
const router = express.Router()


router.get("/",jobOfferController.findAllJobOffers)

router.post("/",jobOfferController.postJobOffer)

router.get("/:id",jobOfferController.findJobOfferById)

router.patch("/:id",jobOfferController.editJobOffer)

router.delete("/:id",jobOfferController.deleteJobOffer)

//Exportar rutas
module.exports = router