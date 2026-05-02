const mongoose = require("mongoose");
const { DOCUMENT_TYPE } = require("./enum")

const documentSchema = new mongoose.Schema({
    // Nombre del archivo adjunto
    FCTM_document_name: {
        type: String,
        required: true
    },

    // Nombre del archivo adjunto
    FCTM_document_description: {
        type: String
    },

    // Tipo de documento
    FCTM_document_type: {
        type: String,
        required: true,
        enum: DOCUMENT_TYPE,
        default: "GENERAL"
    },

    // Usuario que subió el documento (relación con el modelo de UserManager)
    FCTM_document_created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserManager",
        required: true
    },

    // URL del archivo almacenado o referencia al almacenamiento
    FCTM_document_url: {
        type: String,
        required: true
    },

    // Perfiles de usuario que pueden ver este documento
    FCTM_visible_to_profiles: [{
        type: String,
        enum: ["ADMINISTRADOR", "PROFESOR", "ALUMNO", "EMPRESA"],
        required: true
    }],

    // Fecha de creación automática
    FCTM_inserted_date: {
        type: Date,
        default: () => new Date()
    },

    // Fecha de la última actualización
    FCTM_updated_date: {
        type: Date,
        default: () => new Date()
    }
});

// Middleware para actualizar la fecha de actualización
documentSchema.pre("save", function (next) {
    this.FCTM_updated_date = new Date();
    next();
});

// 🔥 Virtual: acciones que contienen este documento
documentSchema.virtual("acciones_relacionadas", {
    ref: "ActionManager",
    localField: "_id",
    foreignField: "FCTM_documents",
});

// 🔥 Virtual: usuarios que tienen este documento en su array FCTM_documents
documentSchema.virtual("usuarios_relacionados", {
    ref: "UserManager",
    localField: "_id",
    foreignField: "FCTM_documents",
});

// 🔥 Virtual: Ofertas de trabajo que contienen este documento
documentSchema.virtual("oferta_relacionada", {
    ref: "JobOfferManager",       // Modelo donde buscar
    localField: "_id",            // El ID del documento actual
    foreignField: "FCTM_documents", // El campo en JobOffer que es un array de IDs de documentos
   // justOne: true                 // Normalmente un documento pertenece a una sola oferta
});

// 🔥 Virtual: FCT que contienen este documento
documentSchema.virtual("fct_relacionada", {
    ref: "fctManager",
    localField: "_id",
    foreignField: "FCTM_documents",
});

// Asegúrate de tener esto (si no lo tienes ya) para que los virtuales se vean:
documentSchema.set("toJSON", { virtuals: true });
documentSchema.set("toObject", { virtuals: true });

const DocumentManager = mongoose.model("DocumentManager", documentSchema);

module.exports = DocumentManager;