const jobOfferService = require("../services/joboffer.service")
const { wrapAsync } = require("../utils/functions")
const AppError = require("../utils/AppError")

exports.findAllJobOffers = wrapAsync(async (req, res, next) => {
    try {
        const offers = await jobOfferService.getAllJobOffer()
        res.status(200).json(offers)
    } catch (error) {
        next(new AppError("No se encontraron ofertas",404))
    }
})

exports.findJobOfferById = wrapAsync(async (req, res, next) => {
    try {
        const {id} = req.params
        const offer = await jobOfferService.getJobOfferById(id)
        res.status(200).json(offer)
    } catch (error) {
        next(new AppError("Error oferta no encontrada", 404))
    }
})

exports.postJobOffer = wrapAsync(async (req, res, next) => {
    try {
        const newOffer = await jobOfferService.createJobOffer(req.body)
        res.status(200).json(newOffer)
    } catch (error) {
        next(new AppError("Error al crear oferta",500))
    }
})

exports.editJobOffer = wrapAsync(async (req, res, next) => {
    try {
        const updatedOffer = await jobOfferService.updateJobOffer(req.params.id,req.body)
        res.status(200).json(updatedOffer)
    } catch (error) {
        next(new AppError("Error al editar oferta",500))
    }
})

exports.deleteJobOffer= wrapAsync(async (req, res, next) => {
    try {
        const removedOffer = await jobOfferService.removeJobOffer(req.params.id)
        res.status(200).json(removedOffer)
    } catch (error) {
        next(new AppError("Error al eliminar oferta",500))
    }
})

