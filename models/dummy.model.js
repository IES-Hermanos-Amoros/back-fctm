const mongoose = require('mongoose');

const dummySchema = new mongoose.Schema({

    // Clave principal (relacionable con UserManager si quieres)
    SAO_id: {
        type: String,
        required: true,
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
        default: null
        // Si más adelante quieres controlar tipos:
        // enum: ["TEXTO", "NUMERO", "BOOLEANO", "OTRO"]
    },

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
