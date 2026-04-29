const documentModel = require('../models/documentManager.model')
const mongoose = require('mongoose')
const ActionManager = require('../models/actionManager.model') // Importante para el populate
const userManager = require('../models/userManager.model') // Importante para la búsqueda de usuarios
const jobOfferManager = require('../models/jobOfferManager.model') // Importante para actualizar ofertas de empleo

//devolver documentos filtrados por perfil
exports.getAll = async userProfile => {
  let query = {}
  if (userProfile !== 'ADMINISTRADOR') {
    query = { FCTM_visible_to_profiles: userProfile }
  }
  const documents = await documentModel
    .find(query)
    .populate({
      path: 'acciones_relacionadas',
      select:
        'FCTM_action_title FCTM_action_type FCTM_action_notes FCTM_action_datetime FCTM_documents FCTM_created_by FCTM_updated_date',
    })
    .populate({
      path: 'usuarios_relacionados',
      select:
        'SAO_name SAO_profile SAO_email SAO_phone SAO_company_nameManager SAO_company_activity SAO_student_id',
    })
    .populate({
      path: 'FCTM_document_created_by',
      model: 'UserManager',
      select: 'SAO_name SAO_profile SAO_email SAO_phone',
    })
    .populate({
      path: 'oferta_relacionada',
      select: 'FCTM_job_title FCTM_job_status',
      populate: {
        path: 'empresa',
        select: 'SAO_name',
      },
    })
    .lean()

  const actionIds = documents.flatMap(doc =>
    doc.acciones_relacionadas.map(a => a._id)
  )
  const users = await userManager
    .find({ FCTM_actions: { $in: actionIds } })
    .select(
      'SAO_name SAO_profile SAO_email SAO_phone SAO_company_nameManager SAO_company_activity SAO_student_id FCTM_actions'
    )
    .lean()

  const mapActionOwner = {}
  users.forEach(u => {
    u.FCTM_actions.forEach(aid => {
      mapActionOwner[aid.toString()] = {
        _id: u._id,
        SAO_name: u.SAO_name,
        SAO_profile: u.SAO_profile,
        SAO_email: u.SAO_email,
        SAO_phone: u.SAO_phone,
        SAO_company_nameManager: u.SAO_company_nameManager,
        SAO_company_activity: u.SAO_company_activity,
        SAO_student_id: u.SAO_student_id,
      }
    })
  })

  documents.forEach(doc => {
    doc.acciones_relacionadas = doc.acciones_relacionadas.map(a => ({
      ...a,
      owner: mapActionOwner[a._id.toString()] || null,
    }))
  })
  return documents
}

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
exports.remove = async (id, userId = null) => {
  //await documentModel.findByIdAndDelete(id)
  // 1. Eliminamos el documento físicamente de la colección de documentos
  const deletedDoc = await documentModel.findByIdAndDelete(id)

  if (!deletedDoc) {
    throw new Error('Documento no encontrado')
  }

  // 2. Si se proporcionó un userId, limpiamos la referencia en el usuario
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    await userManager.updateOne(
      { _id: userId },
      { $pull: { FCTM_documents: id } } // Extrae el ID del array FCTM_documents
    )
  }

  // Opcional: Si el documento también podía estar en una oferta de trabajo,
  // podrías añadir aquí una lógica similar para jobOfferManager si fuera necesario.

  return deletedDoc
}

//INCORRECTO
//insertar varios documentos
exports.insertManyDocuments = async (files, datos) => {
  try {
    if (!files || files.length === 0) {
      throw new Error('No se han recibido archivos para insertar.')
    }

    //Solución ERROR
    //construir los documentos a partir de req.files
    /*const docsToInsert = files.map(file => ({
      originalName: file.originalname,
      fileName: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`,
      uploadedAt: new Date(),
      user: userId || null,
    }))*/
    // visible_to_profiles puede llegar como string único o como array
    let perfiles = datos?.visible_to_profiles || ['ADMINISTRADOR']
    if (typeof perfiles === 'string') perfiles = [perfiles]

    const docsToInsert = files.map(file => ({
      // Usar el nombre del input si existe; si no, el nombre del archivo
      FCTM_document_name: datos?.name || file.originalname,

      FCTM_document_description: datos?.description || '',

      FCTM_document_type: datos?.type || 'GENERAL',

      FCTM_document_created_by: datos?.createdBy,

      FCTM_document_url: `/uploads/${file.filename}`,

      FCTM_visible_to_profiles: perfiles,
    }))

    //insertar los documentos de una vez
    const insertedDocs = await documentModel.insertMany(docsToInsert)

    //si hay userId, actualizar lista de documentos
    if (datos.userId) {
      const docIds = insertedDocs.map(doc => doc._id)

      await userManager.updateOne(
        { _id: datos.userId },
        { $push: { FCTM_documents: { $each: docIds } } }
      )
    }

    //si hay userId, actualizar lista de documentos
    if (datos.jobOfferId) {
      const docIds = insertedDocs.map(doc => doc._id)

      await jobOfferManager.updateOne(
        { _id: datos.jobOfferId },
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

exports.insertManyDocumentsOLD2 = async (files, userId) => {
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
    console.error('Error al insertar documentos:', error.message)
    throw new Error(`Error en la carga de archivos: ${error.message}`)
  }
}
