const userManagerModel = require("../models/userManager.model")

exports.getAll = async () => {
    return await userManagerModel.find({
        SAO_profile: "EMPRESA"
    })
}

exports.getById = async (id) => await userManagerModel.findById(id)

exports.update = async (id,datos) => {
    const updateFields = {};

    Object.keys(data).forEach(key => {
        if (key.startsWith('FCTM_company_')) {
            updateFields[key] = data[key];
        }
    });

    if (Object.keys(updateFields).length === 0) {
        throw new Error('No hay campos FCTM_company_ para actualizar');
    }
    return await userManagerModel.findByIdAndUpdate(id,datos,{new:true})
}