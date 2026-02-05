const DocumentService = require("../services/document.service")

exports.getAllDocuments = async (req,res) => {
    const documents = await DocumentService.getAll()
    if(documents.length > 0){
        res.status(200).json(documents)
    } else {
        res.status(404).json("Sin documentos...")
    }
}

exports.getDocumentById = async (req,res) => {
    const { id } = req.params
    const document = await DocumentService.getById(id)
    if(document){
        res.status(200).json(document)
    } else {
        res.status(404).json("Documento no encontrado")
    }
}

exports.newDocument = async (req,res) => {
    const documentoCreado = await DocumentService.create(req.body)
    if(documentoCreado){
        res.status(200).json(documentoCreado)
    } else {
        res.status(500).json("Error al crear el documento")
    }
}

exports.editDocumentById = async (req,res) => {
    const { id } = req.params
    const documentUpdated = await DocumentService.update(id, req.body)
    if(documentUpdated){
        res.status(200).json(documentUpdated)
    } else {
        res.status(500).json("Error al actualizar el documento")
    }
}

exports.deleteDocumentById = async (req,res) => {
    const { id } = req.params
    const documentDeleted = await DocumentService.remove(id)
    if(documentDeleted){
        res.status(200).json(documentDeleted)
    } else {
        res.status(500).json("Error al eliminar el documento")
    }
}

exports.uploadDocuments = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({mensaje: 'No se han subido archivos'})
        }
        const files = req.files
        const body = req.body
        const insertedDocuments = await DocumentService.insertManyDocuments(files, body)
        res.status(200).json(insertedDocuments.length)
    } catch (error) {
        res.status(500).json(error)
    }
}