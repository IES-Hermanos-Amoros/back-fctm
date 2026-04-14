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


//ERROR (no funcionaba bien la eliminación)
exports.delete = async(id, fctId = null) => {

    console.log("Eliminando reseña con id:", id, "y fctId:", fctId)

    const removedReview = await reviewModel.findByIdAndDelete(id)

    if (!removedReview) return null

    // Limpiamos la referencia en FCTs
    if (fctId) {
        await fctManagerModel.updateOne(
            { _id: fctId },
            { $pull: { FCTM_reviews: removedReview._id } }
        )
    } else {
        await fctManagerModel.updateMany(
            { FCTM_reviews: removedReview._id },
            { $pull: { FCTM_reviews: removedReview._id } }
        )
    }

    return removedReview
}


// Actualización masiva de aptitudes
exports.bulkUpdate = async (ids) => {
   return await reviewModel.updateMany(
      { _id: { $in: ids } }, 
      { $set: { FCTM_review_verified: true } }
    );
};