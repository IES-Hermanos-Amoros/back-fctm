const mongoose = require("mongoose");

const jobOfferSchema = new mongoose.Schema({
    // Título de la oferta de trabajo
    FCTM_job_title: {
        type: String,
        required: true
    },

    // Descripción de la oferta de trabajo
    FCTM_job_description: {
        type: String,
        required: true
    },

    // Requisitos de la oferta
    FCTM_job_requirements: {
        type: String,
        default: null
    },

    // Fecha de inicio de la oferta
    FCTM_job_start_date: {
        type: Date,
        required: true
    },

    // Fecha de cierre de la oferta
    FCTM_job_end_date: {
        type: Date,
        required: true
    },

    // Observaciones de la oferta de trabajo
    FCTM_job_observations: {
        type: String,
    },

    // Salario (diario/mensual/anual - por eso es String OPCIONAL) de la oferta de trabajo
    FCTM_job_salary: {
        type: String,
    },

    // Estado de la oferta (activo, cerrado, etc.)
    FCTM_job_status: {
        type: String,
        required: true,
        enum: ["ACTIVA", "CERRADA", "EN PROGRESO"],
        default: "ACTIVA"
    },

    // Relación con documentos adjuntos (puede tener uno o más documentos)
    FCTM_documents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "DocumentManager",
        default: []
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
jobOfferSchema.pre("save", function (next) {
    this.FCTM_updated_date = new Date();
    next();
});

const JobOfferManager = mongoose.model("JobOfferManager", jobOfferSchema);

module.exports = JobOfferManager;