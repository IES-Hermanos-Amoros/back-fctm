const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    // Título de la reseña
    FCTM_review_title: {
        type: String,
        required: true
    },

    // Texto de la reseña
    FCTM_review_text: {
        type: String,
        required: true
    },

    // Calificación otorgada (por ejemplo, en una escala de 1 a 5)
    FCTM_review_rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },

    // Usuario que dejó la reseña (relación con el modelo de UserManager)
    FCTM_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserManager",
        required: true
    },

    // Fecha en que se creó la reseña
    FCTM_review_date: {
        type: Date,
        default: () => new Date()
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
reviewSchema.pre("save", function (next) {
    this.FCTM_updated_date = new Date();
    next();
});

const ReviewManager = mongoose.model("ReviewManager", reviewSchema);

module.exports = ReviewManager;