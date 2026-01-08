const documentModel = require("../models/documentManager.model")

//devolver documentos
exports.getAll() = documentModel.find()

//devolver documento por su id
exports.getById = async (id) => documentModel.findById(id)

//crear nuevo documento
exports.create = async (datos) => {
    const newDocument = new documentModel(datos)
    return await newDocument.save()
}

//editar documento
exports.update = async (id, datos) => await documentModel.findByIdAndUpdate(id, datos, {new:true})

//eliminar documento
exports.remove = async (id) => await documentModel.findByIdAndDelete(id)