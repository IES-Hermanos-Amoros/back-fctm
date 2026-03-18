const adminService = require('../services/admin.service')
const AppError = require('../utils/AppError')
const { wrapAsync } = require('../utils/functions')

exports.getAllAdmins = wrapAsync(async (req, res, next) => {
  try {
    const admins = await adminService.getAllAdmins()
    res.status(200).json(admins)
  } catch (error) {
    next(new AppError("Error al obtener los admins",500))
  }
})

exports.getAdminById = wrapAsync(async (req, res, next) => {
  try {
    const admin = await adminService.getAdminById(req.params.id)
    if (!admin) return  next(new AppError("Admin no encontrado",404))
    res.status(200).json(admin)
  } catch (error) {
    if (error.kind === 'ObjectId') {
      next(new AppError("Formato de ID inválido",400))
    }
    next(new AppError("Error al obtener el admin",500))
  }
})

/*
exports.editAdminById = wrapAsync(async (req, res, next) => {
  try {
    const updatedAdmin = await adminService.update(req.params.id, req.body)
    if (!updatedAdmin) return next(new AppError("Admin no encontrado",404))
    res.status(200).json(updatedAdmin)
  } catch (error) {
    if (error.message.includes('no es válido')) {
      next(new AppError(error.message,400))
    }
    next(new AppError("Error al actualizar admin",500))
  }
})*/
exports.editAdminById = wrapAsync(async (req, res, next) => {
  try {
    const updatedAdmin = await adminService.update(req.params.id, req.body);
    
    // Si el service devuelve null (aunque lanzamos errores, por seguridad)
    if (!updatedAdmin) return next(new AppError("Admin no encontrado", 404));

    res.status(200).json(updatedAdmin);
  } catch (error) {
    // Si el error ya viene con un status definido (AppError lanzado desde el Service)
    if (error.statusCode) {
      return next(error);
    }

    // Si es un error de validación de campos FCTM_ (Error genérico lanzado con throw new Error)
    if (error.message.includes('no es válido')) {
      return next(new AppError(error.message, 400));
    }

    // Para cualquier otro error no controlado (Base de datos, etc.)
    next(new AppError("Error al actualizar admin: " + error.message, 500));
  }
});
