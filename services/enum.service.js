const EnumeradoModel = require("../models/enum.js")

exports.getAllEnums = () => {
    return EnumeradoModel
}
<<<<<<< HEAD
exports.getEnumByName = async(enumName) => await EnumeradoModel.findOne({enum: enumName})
=======

exports.getEnumByName = async(enumName) => {
    const enumerado = EnumeradoModel[enumName]

    if(!enumerado){
        throw new Error(`El enumerado '${enumName}' no existe.`)
    }

    return enumerado
}
>>>>>>> e05a709f81243c60d56e656e46556f95ba609808
