const DocumentService = require('../services/document.service')
const { wrapAsync } = require('../utils/functions')
const AppError = require('../utils/AppError')

exports.getAllDocuments = wrapAsync(async (req, res, next) => {
  const userProfile = req.user.profile
  const documents = await DocumentService.getAll(userProfile)
  if (documents.length > 0) {
    res.status(200).json(documents)
  } else {
    next(new AppError('Sin documentos ', 404))
  }
})

exports.getDocumentById = wrapAsync(async (req, res, next) => {
  const { id } = req.params
  const document = await DocumentService.getById(id)
  if (document) {
    res.status(200).json(document)
  } else {
    next(new AppError('Documento no encontrado', 404))
  }
})

exports.newDocument = wrapAsync(async (req, res, next) => {
  const documentoCreado = await DocumentService.create(req.body)
  if (documentoCreado) {
    res.status(200).json(documentoCreado)
  } else {
    next(new AppError('Error al crear el documento', 500))
  }
})

exports.editDocumentById = wrapAsync(async (req, res, next) => {
  const { id } = req.params
  const documentUpdated = await DocumentService.update(id, req.body)
  if (documentUpdated) {
    res.status(200).json(documentUpdated)
  } else {
    next(new AppError('Error al actualizar el documento', 500))
  }
})

exports.deleteDocumentById = wrapAsync(async (req, res, next) => {
  const { id } = req.params
  const documentDeleted = await DocumentService.remove(id)
  if (documentDeleted) {
    res.status(200).json(documentDeleted)
  } else {
    next(new AppError('Error al eliminar el documento', 500))
  }
})

exports.uploadDocuments = wrapAsync(async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ mensaje: 'No se han subido archivos' })
    }
    const files = req.files
    const datos = req.body
    datos.createdBy = req.user.id
    const insertedDocuments = await DocumentService.insertManyDocuments(
      files,
      datos
    )
    res.status(200).json(insertedDocuments)
  } catch (error) {
    next(new AppError('Error al subir documentos', 500))
  }
})
