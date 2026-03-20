const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema({
    FCTM_skill_name: {
        type: String,
        required: true,
        unique: true,        
        trim: true,
        uppercase: true
    },
    // Sugerencia: Añadir un campo de 'verificada' para evitar spam
    FCTM_skill_verified: {
        type: Boolean,
        default: false
    },
    // Sugerencia: Contador de popularidad
    FCTM_skill_usage_count: {
        type: Number,
        default: 0
    },

     // Usuario que subió el documento (relación con el modelo de UserManager)
    FCTM_skill_created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserManager",
        required: true
    },

}, { timestamps: true }); // Para saber cuándo se creó cada skill

const Skill = mongoose.model("SkillManager", skillSchema);

module.exports = Skill;