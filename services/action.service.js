const actionModel = require("../models/actionManager.model")

//Obtener todas las acciones
exports.getAll = () => actionModel.find()

//Obtener accion por id
exports.getById = async(id) => actionModel.findById(id)

//Crear una nueva accion
exports.create = async(datos) => {
    const newAction = new actionModel(datos)
    return await newAction.save()
}

//Editar accion
exports.update = async(id,datos) => await actionModel.findByIdAndUpdate(id,datos, {new:true})

//Eliminar accion
exports.remove = async(id) => await actionModel.findByIdAndDelete(id)