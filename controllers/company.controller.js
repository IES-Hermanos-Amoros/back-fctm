const CompanyService = require("../services/company.service.js")
const { wrapAsync } = require("../utils/functions")
const AppError = require("../utils/appError")

exports.getAllCompanies = wrapAsync(async (req,res,next) => {
    let companies = []

    companies = await CompanyService.getAll()

    if(companies.length > 0){
        res.status(200).json(companies)
    }else{
        next(new AppError("Sin empresas",404))
    }      
})

exports.getCompanyById = wrapAsync(async (req,res,next) => {
    const {id} = req.params
    const company = await CompanyService.getById(id)
    if(company){
        res.status(200).json(company)
    }else{
        next(new AppError("Empresa no encontrada",404))

    }
})

exports.editCompanyById = wrapAsync(async (req,res,next) => {
    const {id} = req.params
    const commpanyUpdated = await CompanyService.update(id,req.body)
    if(commpanyUpdated){
        res.status(200).json(commpanyUpdated)
    } else {

        next(new AppError("ERROR al actualizar",500))

    }    
})

