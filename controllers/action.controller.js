const ActionService = require("../services/action.service")
const { wrapAsync } = require("../utils/functions")

//Todas las acciones
exports.getAllActions = wrapAsync(async (req,res) => {
    const actions = await ActionService.getAll()
    if(actions.length > 0){
        res.status(200).json(actions)
    } else {
        next(new AppError("Sin acciones...",404))
    }
})

//Obtener por id
exports.getActionById = wrapAsync(async (req,res) => {
    const { id } = req.params
    const action = await ActionService.getById(id)
    if(action){
        res.status(200).json(action)
    } else {
        next(new AppError("Acción no encontrada",404))
    }
})

//Crear una nueva acción
exports.newAction = wrapAsync(async (req,res) => {

    const actionCreado = await ActionService.create(req.body, req.files)//ERROR req.files={})
    if(actionCreado){
        res.status(200).json(actionCreado)
    } else {
        next(new AppError("Error al crear el acción",500))
    }
})

exports.editActionById = wrapAsync(async (req,res) => {
    const { id } = req.params
    const actionUpdated = await ActionService.update(id, req.body)
    if(actionUpdated){
        res.status(200).json(actionUpdated)
    } else {
        next(new AppError("Error al actualizar la acción",500))
    }
})

exports.deleteActionById = wrapAsync(async (req,res) => {
    const { id } = req.params
    const actionDeleted = await ActionService.remove(id)
    if(actionDeleted){
        res.status(200).json(actionDeleted)
    } else {
        next(new AppError("Error al eliminar la acción",500))
    }
})