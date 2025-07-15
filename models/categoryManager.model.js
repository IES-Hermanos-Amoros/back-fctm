const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    FCTM_category_name: {
        type: String,
        required: true,
        unique: true,
        enum: [
            "AGRO-JARDINERIA Y COMPOSICIONES FLORALES",
            "DESARROLLO DE APLICACIONES WEB",
            "EDUCACIÓN INFANTIL",
            "GESTIÓN FORESTAL Y DEL MEDIO NATURAL",
            "INTEGRACIÓN SOCIAL",
            "PRODUCCIÓN AGROECOLÓGICA",
            "SISTEMAS MICROINFORMÁTICOS Y REDES"
        ],
        trim: true
    }
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;