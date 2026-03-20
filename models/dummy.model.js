const mongoose = require('mongoose');
const { DUMMY_TYPE } = require("./enum")

const dummySchema = new mongoose.Schema({

    // Clave principal (relacionable con UserManager si quieres)
    SAO_id: {
        type: String,
        index: true
    },

    SAO_username: {
        type: String,
        default: null
    },

    SAO_email: {
        type: String,
        default: null
    },

    // Campos dummy personalizados
    FCTM_dummy_observations: {
        type: String,
        default: null
    },

    FCTM_dummy_other_contact: {
        type: String,
        default: null
    },

    FCTM_dummy_description: {
        type: String,
        default: null
    },

    FCTM_dummy_type: {
        type: String,
        default: "OTRO",
        // Si más adelante quieres controlar tipos:
        enum: DUMMY_TYPE
    },

    FCTM_documents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "DocumentManager", // Relación con los documentos
        default: []
    }],

    FCTM_category: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        default: []
    }],

    FCTM_skills: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "SkillManager",
        default: []
    }],

    // Fechas de control
    FCTM_inserted_date: {
        type: Date,
        default: Date.now
    },

    FCTM_updated_date: {
        type: Date,
        default: Date.now
    }

});

// =======================
// MIDDLEWARES
// =======================

// Antes de guardar
dummySchema.pre('save', function (next) {
    this.FCTM_updated_date = new Date();
    if (this.isNew) {
        this.FCTM_inserted_date = new Date();
    }
    next();
});

// Antes de update (findOneAndUpdate, etc.)
dummySchema.pre('findOneAndUpdate', function (next) {
    this.set({ FCTM_updated_date: new Date() });
    next();
});

// =======================
// MODELO
// =======================

const DummyModel = mongoose.model('Dummy', dummySchema);


module.exports = DummyModel;
