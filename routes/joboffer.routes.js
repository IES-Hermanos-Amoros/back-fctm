const jobOfferController = require("../controllers/jobOffer.controller")
const express = require("express")
const router = express.Router()
const { protect } = require("../middlewares/jwt.mw")
const { restrictTo } = require("../middlewares/profile.mw")
const { isOwner } = require("../middlewares/isOwner.mw")
const userManager = require("../models/userManager.model")

//Mostrar el listado de todos los job offers
router.get("/",protect,restrictTo("ADMINISTRADOR","PROFESOR","ALUMNO"),jobOfferController.findAllJobOffers)

//Crear un job offer
router.post("/",protect,restrictTo("ADMINISTRADOR","PROFESOR","EMPRESA"),jobOfferController.postJobOffer)

//Mostrar un job offer conseguido por id
router.get("/:id",protect,isOwner(userManager,"SAO_company_FCT_Number", ["ADMINISTRADOR", "PROFESOR","ALUMNO"]),jobOfferController.findJobOfferById)

//Updatear un job offer
router.patch("/:id",protect,isOwner(userManager,"SAO_company_FCT_Number", ["ADMINISTRADOR", "PROFESOR"]),jobOfferController.editJobOffer)

//Borrar un job offer
router.delete("/:id",protect,isOwner(userManager,"SAO_company_FCT_Number", ["ADMINISTRADOR", "PROFESOR"]),jobOfferController.deleteJobOffer)

//Exportar rutas
module.exports = router