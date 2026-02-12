const mongoose = require("mongoose");
const { CATEGORY_NAME } = require("./enum")

const categorySchema = new mongoose.Schema({
    FCTM_category_name: {
        type: String,
        required: true,
        unique: true,
        enum: CATEGORY_NAME,
        trim: true
    }
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;