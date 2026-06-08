const DocumentService = require('../services/document.service')
const { wrapAsync } = require('../utils/functions')
const AppError = require('../utils/AppError')
const path = require('path')
const fs = require('fs')

exports.downloadDocument = wrapAsync(async (req, res, next) => {
  const { id } = req.params
  const document = await DocumentService.getById(id)

  if (!document || !document.FCTM_document_url) {
    return next(new AppError('Documento no encontrado', 404))
  }

  // El campo FCTM_document_url suele tener el formato "/uploads/nombre_archivo.pdf"
  let relativePath = document.FCTM_document_url.startsWith('/')
    ? document.FCTM_document_url.substring(1)
    : document.FCTM_document_url

  // Aplicar normalización (minúsculas y guiones bajos para espacios) al nombre del archivo
  const parsedPath = path.parse(relativePath)
  const normalizedName = parsedPath.name.toLowerCase().replace(/\s+/g, '_')
  relativePath = path.join(parsedPath.dir, normalizedName + parsedPath.ext)

  const filePath = path.join(__dirname, '..', relativePath)

  if (fs.existsSync(filePath)) {
    res.download(filePath, document.FCTM_document_name)
  } else {
    next(new AppError('El archivo físico no existe en el servidor', 404))
  }
})

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
  const { userId, fctId, companyId, actionId } = req.query;

  const documentDeleted = await DocumentService.remove(id, userId, fctId, companyId, actionId)
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
