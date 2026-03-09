const documentController = require("../controllers/document.controller") 
const { protect } = require("../middlewares/jwt.mw")
const { upload, validateAndScanFiles } = require("../middlewares/upload.middleware")
const express = require("express")
const router = express.Router()


//Mostrar VISTA EJS index.ejs con listado de Documentos
router.get("/",documentController.getAllDocuments)

//Mostrar vista para crear un documento
//router.get("/new",documentController.showNewComment) "VISTA EJS"
router.post(
    "/upload",
    protect,
    upload.array("files", 10),
    validateAndScanFiles,
    documentController.uploadDocuments
);

//POST - Crear Documento
router.post("/",documentController.newDocument)

//Mostrar Documentos por ID
router.get("/:id",documentController.getDocumentById)

//Mostrar vista para editar un Documento
//router.get("/:id/edit",documentController.showEditComment) "VISTA EJS"

//PATCH - Updatear un Documento
router.patch("/:id",documentController.editDocumentById)

//DELETE - Borrar un Documento
router.delete("/:id",documentController.deleteDocumentById)


module.exports = router
