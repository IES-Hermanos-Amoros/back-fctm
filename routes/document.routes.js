const documentController = require("../controllers/document.controller") 
const { upload, validateAndScanFiles } = require("../middlewares/upload.middleware")
const express = require("express")
const router = express.Router()
const jwt = require("../middlewares/jwt.mw.js")
const profile = require("../middlewares/profile.mw.js")
const isOwnerMW = require("../middlewares/isOwner.mw.js")
const DocumentManager = require("../models/documentManager.model.js")

//Mostrar VISTA EJS index.ejs con listado de Documentos
router.get("/", jwt.protect, profile.restrictTo("ADMINISTRADOR", "PROFESOR"), documentController.getAllDocuments)

//Mostrar vista para crear un documento
//router.get("/new",documentController.showNewComment) "VISTA EJS"
router.post(
    "/upload",
    jwt.protect,
    profile.restrictTo("ADMINISTRADOR", "PROFESOR", "EMPRESA", "ALUMNO"),
    upload.array("files", 10),
    validateAndScanFiles,
    documentController.uploadDocuments
);

//POST - Crear Documento
router.post("/", jwt.protect, profile.restrictTo("ADMINISTRADOR", "PROFESOR", "EMPRESA", "ALUMNO"), documentController.newDocument)

//Mostrar Documentos por ID
router.get("/:id", jwt.protect, profile.restrictTo("ADMINISTRADOR", "PROFESOR"), documentController.getDocumentById)

//Mostrar vista para editar un Documento
//router.get("/:id/edit",documentController.showEditComment) "VISTA EJS"

//PATCH - Updatear un Documento
router.patch("/:id", jwt.protect, profile.restrictTo("ADMINISTRADOR", "PROFESOR"), documentController.editDocumentById)

//DELETE - Borrar un Documento
router.delete("/:id", jwt.protect, isOwnerMW.isOwner(DocumentManager, "FCTM_document_created_by", ["ADMINISTRADOR", "PROFESOR"]), documentController.deleteDocumentById)

module.exports = router
