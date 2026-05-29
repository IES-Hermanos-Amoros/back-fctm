const documentModel = require('../models/documentManager.model')
const mongoose = require('mongoose')
const ActionManager = require('../models/actionManager.model') // Importante para el populate
const userManager = require('../models/userManager.model') // Importante para la búsqueda de usuarios
const jobOfferManager = require('../models/jobOfferManager.model') // Importante para actualizar ofertas de empleo
const fctManager = require('../models/fctManager.model') // Importante para actualizar FCTs

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
    .populate({
      path: 'FCTM_document_created_by',
      model: 'UserManager',
      select: 'SAO_name SAO_profile SAO_email SAO_phone',
    })

//crear nuevo documento
exports.create = async datos => {
  const newDocument = new documentModel(datos)
  return await newDocument.save()
}

//editar documento
exports.update = async (id, datos) =>
  await documentModel.findByIdAndUpdate(id, datos, { new: true })

//eliminar documento
exports.remove = async (id, userId = null, fctId = null, companyId = null) => {
  // 1. Eliminamos el documento físicamente de la colección de documentos
  const deletedDoc = await documentModel.findByIdAndDelete(id)

  if (!deletedDoc) {
    throw new Error('Documento no encontrado')
  }

  // 2. Si se proporcionó un userId, limpiamos la referencia en el usuario
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    await userManager.updateOne(
      { _id: userId },
      { $pull: { FCTM_documents: id } }
    )
  }

  // 3. Si se proporcionó un fctId, limpiamos la referencia en la FCT
  if (fctId && mongoose.Types.ObjectId.isValid(fctId)) {
    await fctManager.updateOne(
      { _id: fctId },
      { $pull: { FCTM_documents: id } }
    )
  }

  // 4. Si se proporcionó un companyId, limpiamos la referencia en la empresa
  if (companyId && mongoose.Types.ObjectId.isValid(companyId)) {
    await userManager.updateOne(
      { _id: companyId },
      { $pull: { FCTM_documents: id } }
    )
  }

  return deletedDoc
}

//insertar varios documentos
exports.insertManyDocuments = async (files, datos) => {
  try {
    if (!files || files.length === 0) {
      throw new Error('No se han recibido archivos para insertar.')
    }

    // 1. Normalización robusta de los perfiles que reciben visibilidad
    let perfilesRaw = datos?.visible_to_profiles;
    let perfiles = [];

    if (!perfilesRaw) {
      perfiles = ['ADMINISTRADOR', 'PROFESOR']; // Valor por defecto si viene completamente vacío
    } else if (typeof perfilesRaw === 'string') {
      if (perfilesRaw.includes(',')) {
        perfiles = perfilesRaw.split(',').map(p => p.trim());
      } else {
        perfiles = [perfilesRaw.trim()];
      }
    } else if (Array.isArray(perfilesRaw)) {
      perfiles = perfilesRaw;
    }

    // GESTIÓN CRÍTICA: Forzamos que ADMINISTRADOR y PROFESOR siempre estén incluidos en la lista de visibilidad
    perfiles = [...new Set(['ADMINISTRADOR', 'PROFESOR', ...perfiles])];

    // 2. Validación y casteo seguro del creador a ObjectId de Mongoose
    const createdBy = datos?.createdBy && mongoose.Types.ObjectId.isValid(datos.createdBy)
      ? new mongoose.Types.ObjectId(datos.createdBy)
      : undefined;

    // 3. Construcción del mapeo de inserción masiva
    const docsToInsert = files.map(file => ({
      FCTM_document_name: datos?.name || file.originalname,
      FCTM_document_description: datos?.description || '',
      FCTM_document_type: datos?.type || 'GENERAL',
      FCTM_document_created_by: createdBy, // Asignación limpia y segura
      FCTM_document_url: `/uploads/${file.filename}`,
      FCTM_visible_to_profiles: perfiles,
    }))

    // Insertar los documentos en la base de datos de una sola vez
    const insertedDocs = await documentModel.insertMany(docsToInsert)

    // 4. Inyección de referencias cruzadas (Relaciones en cascada)
    const docIds = insertedDocs.map(doc => doc._id)

    if (datos.userId) {
      await userManager.updateOne(
        { _id: datos.userId },
        { $push: { FCTM_documents: { $each: docIds } } }
      )
    }

    if (datos.jobOfferId) {
      await jobOfferManager.updateOne(
        { _id: datos.jobOfferId },
        { $push: { FCTM_documents: { $each: docIds } } }
      )
    }

    if (datos.fctId) {
      await fctManager.updateOne(
        { _id: datos.fctId },
        { $push: { FCTM_documents: { $each: docIds } } }
      )
    }

    if (datos.companyId) {
      await userManager.updateOne(
        { _id: datos.companyId },
        { $push: { FCTM_documents: { $each: docIds } } }
      )
    }

    return insertedDocs
  } catch (error) {
    console.error('Error insertando varios documentos:', error)
    throw error
  }
}

