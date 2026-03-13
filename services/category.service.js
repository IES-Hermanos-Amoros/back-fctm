const categoryModel = require('../models/categoryManager.model');

exports.getAll = async () => {
    return await categoryModel.find().sort({ FCTM_category_name: 1 });
}

exports.getById = async (id) => {
    return await categoryModel.findById(id);
}