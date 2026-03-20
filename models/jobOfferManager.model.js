const mongoose = require("mongoose");
const { JOB_STATUS } = require("./enum")

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
        //required: true
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
        enum: JOB_STATUS,
        default: "ACTIVA"
    },

    // Relación con documentos adjuntos (puede tener uno o más documentos)
    FCTM_documents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "DocumentManager",
        default: []
    }],

    FCTM_skills: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "SkillManager", // Relación con las aptitudes
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

jobOfferSchema.virtual("empresa", {
    ref: "UserManager",           // El modelo donde buscar
    localField: "_id",            // El ID de la oferta
    foreignField: "FCTM_job_offers", // El campo en UserManager que contiene el array de IDs
    justOne: true                 // Queremos el objeto de la empresa, no un array
});


// 🔥 Para que el virtual llegue al frontend
jobOfferSchema.set("toJSON", { virtuals: true });
jobOfferSchema.set("toObject", { virtuals: true });


const JobOfferManager = mongoose.model("JobOfferManager", jobOfferSchema);

module.exports = JobOfferManager;