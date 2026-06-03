const jobOfferController = require("../controllers/jobOffer.controller")
const express = require("express")
const router = express.Router()
const { protect } = require("../middlewares/jwt.mw")
const { restrictTo } = require("../middlewares/profile.mw")
const { isOwnerArray } = require("../middlewares/isOwnerArray.mw")
const UserManager = require("../models/userManager.model")

//Mostrar el listado de todos los job offers
router.get("/",protect,restrictTo("ADMINISTRADOR","PROFESOR","ALUMNO"),jobOfferController.findAllJobOffers)

//Crear un job offer
router.post("/",protect,restrictTo("ADMINISTRADOR","PROFESOR","EMPRESA"),jobOfferController.postJobOffer)

//Mostrar un job offer conseguido por id
//Logueado y ser admin, teacher, alumno o la empresa que ha creado la oferta de trabajo (owner)
router.get("/:id",
    protect,
    isOwnerArray(UserManager, "FCTM_job_offers", ["ADMINISTRADOR", "PROFESOR", "ALUMNO"],
    "id", 
    false),
    jobOfferController.findJobOfferById)

//Updatear un job offer
//Logueado y ser admin, teacher o la empresa que ha creado la oferta de trabajo (owner)
router.patch("/:id",
    protect,
     isOwnerArray(UserManager, "FCTM_job_offers", ["ADMINISTRADOR", "PROFESOR"],
    "id", 
    false),
    jobOfferController.editJobOffer)

//Borrar un job offer
//Logueado y ser admin, teacher o la empresa que ha creado la oferta de trabajo (owner)
router.delete("/:id",
    protect,
     isOwnerArray(UserManager, "FCTM_job_offers", ["ADMINISTRADOR", "PROFESOR"],
    "id", 
    false),
    jobOfferController.deleteJobOffer)

//Exportar rutas
module.exports = router