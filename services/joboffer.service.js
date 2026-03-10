const jobOfferModel = require('../models/jobOfferManager.model')

//Devolver todas las ofertas de trabajo
exports.getAllJobOffer = async () => {
    return await jobOfferModel.find()
    .populate({
        path: "empresa",
        // Usamos los nombres de campos de tu modelo UserManager
        select: "SAO_name SAO_organization SAO_company_city" 
    })
    .sort({ FCTM_inserted_date: -1 }); // Orden por fecha de inserción
}

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