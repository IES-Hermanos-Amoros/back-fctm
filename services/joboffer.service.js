const jobOfferModel = require('../models/jobOfferManager.model')
const userManagerModel = require('../models/userManager.model')

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
exports.getJobOfferById = async (id) => await jobOfferModel.findById(id).populate({
        path: "empresa",
        // Usamos los nombres de campos de tu modelo UserManager
        select: "SAO_name SAO_organization SAO_company_city" 
    })//.populate("DocumentManager", "FCTM_document_name")

//Crear una nueva oferta de trabajo
exports.createJobOffer = async (data) => {
    const { companyId, ...jobOfferData } = data || {}
    const newJobOffer = new jobOfferModel(jobOfferData)
    const savedOffer = await newJobOffer.save()

    // Si viene la empresa creadora, relacionamos la oferta con ella
    if (companyId) {
        await userManagerModel.findOneAndUpdate(
            { _id: companyId, SAO_profile: "EMPRESA" },
            { $addToSet: { FCTM_job_offers: savedOffer._id } },
            { new: true }
        )
    }

    return savedOffer
}

//Edita una oferta de trabajo existente
exports.updateJobOffer = async (id, data) => {
    return await jobOfferModel.findByIdAndUpdate(id, data, {new:true}).populate({
        path: "empresa",
        // Usamos los nombres de campos de tu modelo UserManager
        select: "SAO_name SAO_organization SAO_company_city" 
    })
}

//Elimina una oferta de trabajo
exports.removeJobOffer = async(id, companyId = null) => {
    const removedOffer = await jobOfferModel.findByIdAndDelete(id)

    if (!removedOffer) return null

    // Limpiamos la referencia en UserManager
    if (companyId) {
        await userManagerModel.updateOne(
            { _id: companyId },
            { $pull: { FCTM_job_offers: removedOffer._id } }
        )
    } else {
        await userManagerModel.updateMany(
            { FCTM_job_offers: removedOffer._id },
            { $pull: { FCTM_job_offers: removedOffer._id } }
        )
    }

    return removedOffer
}
