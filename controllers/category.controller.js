const categoryService = require('../services/category.service');
const { wrapAsync } = require('../utils/functions');
const AppError = require('../utils/AppError'); // Asumiendo que esta es la ruta de tu clase AppError

exports.getAllCategories = wrapAsync(async (req, res, next) => {
    try {
        const categories = await categoryService.getAll();
        res.status(200).json(categories);
    } catch (error) {
        next(new AppError("Error al obtener todas las categorías", 500));
    }
})

exports.getCategoryById = wrapAsync(async (req, res, next) => {
    try {
        const { id } = req.params;
        const category = await categoryService.getById(id);

        if (!category) {
            return next(new AppError("No se encontró la categoría", 404));
        }

        res.status(200).json(category);
    } catch (error) {
        next(new AppError("Error al obtener la categoría", 500));
    }
})