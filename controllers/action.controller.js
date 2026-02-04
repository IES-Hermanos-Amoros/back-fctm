const ActionService = require("../services/action.service")

//Todas las acciones
exports.getAllActions = async (req,res) => {
    const actions = await ActionService.getAll()
    if(actions.length > 0){
        res.status(200).json(actions)
    } else {
        res.status(404).json("Sin acciones...")
    }
}

//Obtener por id
exports.getActionById = async (req,res) => {
    const { id } = req.params
    const action = await ActionService.getById(id)
    if(action){
        res.status(200).json(action)
    } else {
        res.status(404).json("Acción no encontrada")
    }
}

//Crear una nueva acción
exports.newAction = async (req,res) => {
    const actionCreado = await ActionService.create(req.body)
    if(actionCreado){
        res.status(200).json(actionCreado)
    } else {
        res.status(500).json("Error al crear el acción")
    }
}

exports.editActionById = async (req,res) => {
    const { id } = req.params
    const actionUpdated = await ActionService.update(id, req.body)
    if(actionUpdated){
        res.status(200).json(actionUpdated)
    } else {
        res.status(500).json("Error al actualizar la acción")
    }
}

exports.deleteActionById = async (req,res) => {
    const { id } = req.params
    const actionDeleted = await ActionService.remove(id)
    if(actionDeleted){
        res.status(200).json(actionDeleted)
    } else {
        res.status(500).json("Error al eliminar la acción")
    }
}