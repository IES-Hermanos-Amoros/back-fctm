const EnumeradoModel = require("../models/enum.js")

exports.getAllEnums = async() => await EnumeradoModel.find()

exports.getEnumByName = async(enumName) => await EnumeradoModel.findOne({enum: enumName})