const userManagerModel = require("../models/userManager.model")

exports.getAll = async () => {
    return await userManagerModel.find({
        SAO_profile: "EMPRESA"
    })
}

exports.getById = async (id) => await userManagerModel.findById(id)

exports.update = async (id,datos) => {
    const keys = Object.keys(datos)

    const tieneSAO = keys.some(key => key.startsWith("SAO_"))
    if(tieneSAO){
        return "ERR_SAO"
    }

    const updateFields = {}
    keys.forEach(key => {
        if(key.startsWith("FCTM_")) {
            updateFields[key] = datos[key]
        }
    })

    if(Object.keys(updateFields).length === 0){
        return null
    }

    return await userManagerModel.findByIdAndUpdate(id, updateFields, { new:true })
}