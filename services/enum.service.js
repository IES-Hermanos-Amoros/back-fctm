const EnumeradoModel = require("../models/enum.js")

exports.getAllEnums = () => {
    return EnumeradoModel
}
exports.getEnumByName = async(enumName) => await EnumeradoModel.findOne({enum: enumName})