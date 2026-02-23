const userManagerModel = require("../models/userManager.model")
require("../models/categoryManager.model");

exports.getAll = async () => {
    return await userManagerModel.find({
        SAO_profile: "EMPRESA"
    })
    .populate("FCTM_company_category", "FCTM_category_name")
}

exports.getById = async (id) => {
    return await userManagerModel.findById(id)
        .populate({
            path: "FCTM_job_offers",
            // Seleccionamos los campos exactos que necesita tu tabla en el frontend
            select: "FCTM_job_title FCTM_job_start_date FCTM_job_end_date FCTM_job_status"
        });
}

exports.update = async (id,datos) => {
    console.log({
        id, datos
    })
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