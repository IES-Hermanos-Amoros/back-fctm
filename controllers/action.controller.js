const ActionService = require("../services/action.service")
const CompanyService = require("../services/company.service")
const { wrapAsync } = require("../utils/functions")
const mongoose = require("mongoose");
const CompanyModel = require("../models/userManager.model"); // El modelo que uses para empresas

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
    const payload = {
        ...req.body,
        FCTM_created_by: req.body?.FCTM_created_by || req.user?.id
    }

    const actionCreado = await ActionService.create(payload, req.files)//ERROR req.files={})
    if(actionCreado){
        res.status(200).json(actionCreado)
    } else {
        next(new AppError("Error al crear el acción",500))
    }
})

exports.editActionById = wrapAsync(async (req,res) => {
    const { id } = req.params
    const actionUpdated = await ActionService.update(id, req.body, req.files)
    if(actionUpdated){
        res.status(200).json(actionUpdated)
    } else {
        next(new AppError("Error al actualizar la acción",500))
    }
})

exports.deleteActionById = wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const { companyId } = req.query;

    const actionDeleted = await ActionService.remove(id);

    if (actionDeleted) {
        if (companyId) {
            // USAR EL MODELO DIRECTAMENTE
            await CompanyModel.findByIdAndUpdate(companyId, {
                $pull: { FCTM_actions: new mongoose.Types.ObjectId(id) }
            });
        }
        return res.status(200).json(actionDeleted);
    } else {
        return next(new AppError("Error al eliminar la acción", 500));
    }
});
