const { wrapAsync } = require('../utils/')
const AppError = require("../utils/AppError")
const fctService = require("../services/fct.service")   


exports.findAllFcts = wrapAsync(async (req, res, next) => {
    let fcts = await fctService.findAll()
    if(fcts.length > 0) {
        res.status(200).json(fcts)
    }else{
        next(new AppError("Sin FCTs",404))
    }   
})

exports.findFctById = wrapAsync(async (req, res, next) => {
    const fct = await fctService.findById(req.params.id)
    if(fct) {
        res.status(200).json(fct)
    } else {
        next(new AppError("FCT no encontrada", 404))
    }
})

exports.editFct = wrapAsync(async (req, res, next) => { 
    const tieneCamposFCTM = Object.keys(req.body)
        .some(key => key.startsWith("FCTM_"))
    if (!tieneCamposFCTM) {
        return next(new AppError("No se pudo actualizar: los campos deben empezar por FCTM_",403))
    }

    const updatedFct = await fctService.updatedFctmFields(req.params.id, req.body)
    if(updatedFct) {
        res.status(200).json(updatedFct)
    } else {
        next(new AppError("No se pudo actualizar la FCT", 400))
    }
})