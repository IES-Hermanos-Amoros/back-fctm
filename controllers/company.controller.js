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

exports.bulkUpdateSkills = wrapAsync(async (req, res, next) => {
  try {
    const { ids, skills } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return next(new AppError("Debe proporcionar un array de IDs de empresas", 400));
    }

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return next(new AppError("Debe proporcionar un array de aptitudes", 400));
    }

    const result = await CompanyService.bulkUpdateSkills(ids, skills);

    res.status(200).json({
      message: 'Aptitudes de empresas actualizadas correctamente',
      data: result,
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
});

exports.bulkUpdateCategories = wrapAsync(async (req, res, next) => {
  try {
    const { ids, categoryIds } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return next(new AppError("Debe proporcionar un array de IDs de empresas", 400));
    }

    if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
      return next(new AppError("Debe proporcionar un array de familias profesionales", 400));
    }

    const result = await CompanyService.bulkUpdateCategories(ids, categoryIds);

    res.status(200).json({
      message: 'Familias Profesionales de empresas actualizadas correctamente',
      data: result,
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
});

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