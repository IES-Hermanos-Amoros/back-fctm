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


// Actualización masiva
exports.bulkUpdate = async (ids) => {
   return await reviewModel.updateMany(
      { _id: { $in: ids } }, 
      { $set: { FCTM_review_verified: true } }
    );
};

exports.allDelete = async (ids) => {
   await fctManagerModel.updateMany(
      { FCTM_reviews: { $in: ids } },
      { $pullAll: { FCTM_reviews: ids } }
   );
   return await reviewModel.deleteMany({ _id: { $in: ids } });
};

// Listado global cruzando datos de Empresa y Alumno para la vista de admin/profes
exports.getGlobalReviews = async () => {
    return await reviewModel.aggregate([
        // 2. FILTRO: Añadimos el $match al principio para procesar solo las reseñas deseadas
        { 
            $match: { 
                FCTM_review_verified: true 
            } 
        },
        // Ordenar por fecha de inserción (de más nueva a más vieja)
        { $sort: { FCTM_inserted_date: -1 } },

        // Buscar a qué FCT pertenece esta reseña
        {
            $lookup: {
                from: "fctmanagers", 
                localField: "_id",
                foreignField: "FCTM_reviews",
                as: "fct_asociada"
            }
        },
        { $unwind: { path: "$fct_asociada", preserveNullAndEmptyArrays: true } },

        // Sacar los datos del Alumno (autor de la reseña)
        {
            $lookup: {
                from: "usermanagers",
                localField: "FCTM_user_id",
                foreignField: "_id",
                as: "alumno_datos"
            }
        },
        { $unwind: { path: "$alumno_datos", preserveNullAndEmptyArrays: true } },

        // Sacar la Empresa usando el CIF/ID de la FCT que hemos sacado antes
        {
            $lookup: {
                from: "usermanagers",
                localField: "fct_asociada.SAO_company_id",
                foreignField: "SAO_id",
                as: "empresa_datos"
            }
        },
        { $unwind: { path: "$empresa_datos", preserveNullAndEmptyArrays: true } },

        // Filtrar y limpiar los campos que se envían al Front
        {
            $project: {
                _id: 1,
                FCTM_review_title: 1,
                FCTM_review_text: 1,
                FCTM_review_rating: 1,
                FCTM_review_date: 1,
                FCTM_inserted_date: 1,
                // Si la empresa tiene organización ponemos esa, si no, el nombre normal
                empresa_nombre: { 
                    //ERROR
                    //$ifNull: [ "$empresa_datos.SAO_organization", "$empresa_datos.SAO_name", "Empresa no asignada" ] 
                    $ifNull: [ "$empresa_datos.SAO_name", "Empresa no asignada" ] 
                },
                alumno_nombre: { 
                    $ifNull: [ "$alumno_datos.SAO_name", "Alumno Anónimo" ] 
                }
            }
        }
    ]);
};