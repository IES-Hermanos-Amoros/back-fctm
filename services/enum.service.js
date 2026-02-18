const EnumeradoModel = require("../models/enum.js")

exports.getAllEnums = () => {
    return EnumeradoModel
}

exports.getEnumByName = async(enumName) => {
    const enumerado = EnumeradoModel[enumName]

    if(!enumerado){
        throw new Error(`El enumerado '${enumName}' no existe.`)
    }

    return enumerado
}