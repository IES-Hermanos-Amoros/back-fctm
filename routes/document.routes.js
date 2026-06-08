const documentController = require('../controllers/document.controller')
const {
  upload,
  validateAndScanFiles,
} = require('../middlewares/upload.middleware')
const express = require('express')
const router = express.Router()
const jwt = require('../middlewares/jwt.mw.js')
const profile = require('../middlewares/profile.mw.js')
const isOwnerMW = require('../middlewares/isOwner.mw.js')
const DocumentManager = require('../models/documentManager.model.js')
const authorizeDocumentAccess = require('../middlewares/authorizeDocument.mw.js')

//Mostrar VISTA EJS index.ejs con listado de Documentos
router.get(
  '/',
  jwt.protect,
  //profile.restrictTo('ADMINISTRADOR', 'PROFESOR'), //ERROR. El filtrado se realiza en el service, no aquí. Aquí se deja pasar a todos los perfiles, y el service se encarga de filtrar según el perfil del usuario.
  documentController.getAllDocuments
)

//Mostrar vista para crear un documento
//router.get("/new",documentController.showNewComment) "VISTA EJS"
router.post(
  '/upload',
  jwt.protect,
  upload.array('files', 10),
  validateAndScanFiles,
  documentController.uploadDocuments
)

//POST - Crear Documento
router.post('/', jwt.protect, documentController.newDocument)

//Mostrar Documentos por ID
router.get(
  '/:id',
  jwt.protect,
  authorizeDocumentAccess('read'),
  documentController.getDocumentById
)

// Descargar archivo físico del documento
router.get(
  '/:id/download',
  jwt.protect,
  authorizeDocumentAccess('read'),
  documentController.downloadDocument
)

//Mostrar vista para editar un Documento
//router.get("/:id/edit",documentController.showEditComment) "VISTA EJS"

//PATCH - Updatear un Documento
router.patch(
  '/:id',
  jwt.protect,
  authorizeDocumentAccess('update'),
  documentController.editDocumentById
)

//DELETE - Borrar un Documento
//Logueado y ser admin, teacher o el alumno que ha creado el documento (owner)
router.delete(
  '/:id',
  jwt.protect,
  isOwnerMW.isOwner(DocumentManager, 'FCTM_document_created_by', [
    'ADMINISTRADOR',
    'PROFESOR',
    'EMPRESA'
  ]),
  //authorizeDocumentAccess('delete'),
  documentController.deleteDocumentById
)

module.exports = router
