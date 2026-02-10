const documentModel = require('../models/documentManager.model')
const userModel = require('../models/userManager.model')
const mongoose = require('mongoose')

//devolver documentos
exports.getAll = () => documentModel.find()

//devolver documento por su id
exports.getById = async id => documentModel.findById(id)

//crear nuevo documento
exports.create = async datos => {
  const newDocument = new documentModel(datos)
  return await newDocument.save()
}

//editar documento
exports.update = async (id, datos) =>
  await documentModel.findByIdAndUpdate(id, datos, { new: true })

//eliminar documento
exports.remove = async id => await documentModel.findByIdAndDelete(id)

//insertar varios documentos
exports.insertManyDocuments = async (files, userId) => {
  try {
    // validación inicial de entrada
    if (!files || files.length === 0) {
      throw new Error('No hay archivos para insertar.')
    }

    const createdBy = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : undefined

    //mapeo de docs a insertar
    const docsToInsert = files.map(file => ({
      FCTM_document_name: file.originalname,
      FCTM_document_url: `/uploads/${file.filename}`,
      FCTM_document_mimetype: file.mimetype,
      FCTM_document_size: file.size,
      FCTM_document_created_by: createdBy,
      FCTM_document_created_date: new Date(),
    }))

    const result = await documentModel.insertMany(docsToInsert)
    return result
  } catch (error) {
    console.error(
      'Error al insertar documentos:',
      error.message
    )
    throw new Error(`Error en la carga de archivos: ${error.message}`)
  }
}
