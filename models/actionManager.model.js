const mongoose = require("mongoose");

const actionSchema = new mongoose.Schema({
    // Título identificativo para la acción (que luego servirá para el Gestor Documental y demás)
    FCTM_action_title: {
        type: String,
        required: true
    },

    // Tipo de acción realizada
    FCTM_action_type: {
        type: String,
        required: true,
        enum: ["VISITA", "EMAIL", "LLAMADA", "REUNIÓN", "OTRO"]
    },

    // Fecha y hora en la que ocurrió la acción
    FCTM_action_datetime: {
        type: Date,
        required: true
    },

    // Observaciones o comentarios sobre la acción
    FCTM_action_notes: {
        type: String,
        default: null
    },

    // Usuario al que se le realizó la acción (relación con userManager)
    /*FCTM_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserManager",
        required: true
    },*/

    // Quién realizó la acción (por si la lleva a cabo otro usuario del sistema)
    FCTM_created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserManager",
        required: false
    },

    // Fecha y hora de creación automática
    FCTM_inserted_date: {
        type: Date,
        default: () => new Date()
    },

    // Fecha y hora de la última actualización
    FCTM_updated_date: {
        type: Date,
        default: () => new Date()
    },

    // Relación con documentos adjuntos
    FCTM_documents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "DocumentManager",
        default: []
    }]
},
  {
    timestamps: true, // Crea automáticamente createdAt y updatedAt
    versionKey: false, // Elimina el campo __v
  }
);

// Middleware para actualizar la fecha de actualización
actionSchema.pre("save", function (next) {
    this.FCTM_updated_date = new Date();
    next();
});


// Virtual para resolver el usuario vinculado desde la propia acción leyendo quién lo tiene en su array
actionSchema.virtual("usuario_relacionado", {
  ref: "UserManager",
  localField: "_id",
  foreignField: "FCTM_actions",
  justOne: true
});


const ActionManager = mongoose.model("ActionManager", actionSchema);

module.exports = ActionManager;