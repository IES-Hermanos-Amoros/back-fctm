const CompanyService = require("../services/company.service.js")
const { wrapAsync } = require("../utils/functions")
const AppError = require("../utils/AppError")

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

exports.editCompanyById = wrapAsync(async (req, res, next) => {
const { id } = req.params;
const companyUpdated = await CompanyService.update(id, req.body);

if (companyUpdated === 'ERR_SAO') {
return next(new AppError("error SAO", 400));
}

if (companyUpdated === null) {
return next(new AppError("ERROR al actualizar, no hay FCTM", 400));
}

if (!companyUpdated) {
return next(new AppError("Compañía no encontrada", 404));
}

res.status(200).json(companyUpdated);
})