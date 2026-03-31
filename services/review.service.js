const mongoose = require("mongoose")
const reviewModel = require("../models/reviewManager.model")
const fctManager = require("../models/fctManager.model")

//Devolver todos los comentarios
exports.getAll = async (getVerified) => {
    return await reviewModel.find({ FCTM_review_verified: getVerified }).sort({ FCTM_review_date: -1 });
};

//Devolver un comentario por ID
//SELECT * from Comments WHERE _id = id
exports.getById = async (id) => await reviewModel.findById(id).populate("FCTM_user_id", "SAO_name")

//Crear un nuevo comentario y asociarlo a la FCT
exports.create = async(datos) => {  
    const { FCTM_fct_id, ...reviewData } = datos;
    
    let fctObjectId = null;
    if (FCTM_fct_id && mongoose.Types.ObjectId.isValid(FCTM_fct_id)) {
        fctObjectId = new mongoose.Types.ObjectId(FCTM_fct_id);
    }
    
    // Verificar si la FCT existe si se proporcionó un ID
    if (fctObjectId) {
        const fctExists = await fctManager.findById(fctObjectId);
        if (!fctExists) {
            fctObjectId = null;
        }
    }
    
    const newReview = new reviewModel({
        ...reviewData,
        FCTM_fct_id: fctObjectId,
        FCTM_review_rating: Number(reviewData.FCTM_review_rating) || 5
    })
    
    const savedReview = await newReview.save()
    
    if (fctObjectId) {
        await fctManager.findByIdAndUpdate(
            fctObjectId,
            { $addToSet: { FCTM_reviews: savedReview._id } }
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
