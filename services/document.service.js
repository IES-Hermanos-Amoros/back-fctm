const documentModel = require('../models/documentManager.model')
const userModel = require('../models/userManager.model')

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
exports.insertManyDocuments = async (files, userId = null) => {
  try {
    if (!files || files.length === 0) {
      throw new Error('No se han recibido archivos para insertar.')
    }

    //construir los documentos a partir de req.files
    const docsToInsert = files.map(file => ({
      originalName: file.originalname,
      fileName: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`,
      uploadedAt: new Date(),
      user: userId || null,
    }))

    //insertar los documentos de una vez
    const insertedDocs = await documentModel.insertMany(docsToInsert)

    //si hay userId, actualizar lista de documentos
    if (userId) {
      const docIds = insertedDocs.map(doc => doc._id)

      await userModel.updateOne(
        { _id: userId },
        { $push: { FCTM_documents: { $each: docIds } } }
      )
    }

    //devolver los documentos
    return insertedDocs
  } catch (error) {
    console.error('Error insertando varios documentos:', error)
    throw error
  }
}
