const mongoose = require("mongoose")
const reviewModel = require("../models/reviewManager.model")
const fctManagerModel = require("../models/fctManager.model")

//Devolver todos los comentarios
exports.getAll = async (getVerified) => {
    return await reviewModel.find({ FCTM_review_verified: getVerified }).sort({ FCTM_review_date: -1 });
};

//Devolver un comentario por ID
//SELECT * from Comments WHERE _id = id
exports.getById = async (id) => await reviewModel.findById(id).populate("FCTM_user_id", "SAO_name")

//Crear un nuevo comentario y asociarlo a la FCT
exports.create = async(datos) => {  
    console.log("Datos recibidos:", datos)
    const { fctId, FCTM_user_id, ...reviewData } = datos || {}
    console.log("fctId:", fctId, "FCTM_user_id:", FCTM_user_id)
    console.log("reviewData:", reviewData)
    
    const newReview = new reviewModel({
        ...reviewData,
        FCTM_user_id,
        FCTM_review_verified: false
    })
    console.log("newReview a guardar:", newReview)
    
    const savedReview = await newReview.save()
    console.log("Reseña guardada:", savedReview)

    // Si viene el fctId, relacionamos la reseña con la FCT
    if (fctId) {
        console.log("Actualizando FCT con fctId:", fctId)
        await fctManagerModel.findOneAndUpdate(
            { _id: fctId },
            { $addToSet: { FCTM_reviews: savedReview._id } },
            { new: true }
        )
    }

    return savedReview
}

//Edita un comentario existente
exports.update = async (id,datos) => {
   return await reviewModel.findByIdAndUpdate(id,datos,{new:true})
}

//Elimina un comentario
exports.delete = async(id) => {
    const review = await reviewModel.findById(id)
    if (review) {
        await fctManager.findByIdAndUpdate(
            review.FCTM_fct_id,
            { $pull: { FCTM_reviews: id } }
        )
    }
    return await reviewModel.findByIdAndDelete(id)
}
