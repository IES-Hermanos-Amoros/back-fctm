const userManagerModel = require("../models/userManager.model")

exports.getAll = async () => {
    return await userManagerModel.find({
        SAO_profile: "EMPRESA"
    })
}

exports.getById = async (id) => await userManagerModel.findById(id)

exports.update = async (id,datos) => {
    const updateFields = {};

    Object.keys(datos).forEach(key => {
        if (key.startsWith('FCTM_')) {
            updateFields[key] = datos[key];
        }else{
            throw new Error('No se pueden actualizar los campos SAO_');
        }
    });

    if (Object.keys(updateFields).length === 0) {
        throw new Error('No hay campos FCTM_ para actualizar');
    }
    return await userManagerModel.findByIdAndUpdate(id,datos,{new:true})
}