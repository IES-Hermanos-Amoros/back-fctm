const jobOfferController = require("../controllers/joboffer.controller")
const express = require("express")
const router = express.Router()

//Mostrar el listado de todos los job offers
router.get("/",jobOfferController.findAllJobOffers)

//Crear un job offer
router.post("/",jobOfferController.postJobOffer)

//Mostrar un job offer conseguido por id
router.get("/:id",jobOfferController.findJobOfferById)

//Updatear un job offer
router.patch("/:id",jobOfferController.editJobOffer)

//Borrar un job offer
router.delete("/:id",jobOfferController.deleteJobOffer)

//Exportar rutas
module.exports = router