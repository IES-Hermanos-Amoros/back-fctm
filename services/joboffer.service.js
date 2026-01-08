const jobOfferModel = require('../models/jobOfferManager.model')

//Devolver todas las ofertas de trabajo
exports.getAllJobOffer = async () => await jobOfferModel.find()
//.populate("DocumentManager", "FCTM_document_name")

//Devolver una oferta de trabajo por ID
exports.getJobOfferById = async (id) => await jobOfferModel.findById(id)//.populate("DocumentManager", "FCTM_document_name")

//Crear una nueva oferta de trabajo
exports.createJobOffer = async (data) => {
    const newJobOffer = new jobOfferModel(data)
    return await newJobOffer.save()
}

//Edita una oferta de trabajo existente
exports.updateJobOffer = async (id, data) => {
    return await jobOfferModel.findByIdAndUpdate(id, data, {new:true})
}

//Elimina una oferta de trabajo
exports.removeJobOffer = async(id) => {
    return await jobOfferModel.findByIdAndDelete(id)
}