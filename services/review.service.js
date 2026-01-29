const reviewModel = require("../models/reviewManager.model")

//Devolver todos los comentarios
exports.getAll = async () => await reviewModel.find()

//Devolver un comentario por ID
//SELECT * from Comments WHERE _id = id
exports.getById = async (id) => await reviewModel.findById(id)

//Crear un nuevo comentario
exports.create = async(datos) => {  
    const newReview = new reviewModel(datos)
    return await newReview.save()
}

//Edita un comentario existente
exports.update = async (id,datos) => {
   return await reviewModel.findByIdAndUpdate(id,datos,{new:true})
}

//Elimina un comentario
exports.delete = async(id) => {
    return await reviewModel.findByIdAndDelete(id)
}
