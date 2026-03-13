const categoryController = require("../controllers/category.controller");
const express = require("express");
const router = express.Router();

// Obtener todas las categorías 
router.get("/", categoryController.getAllCategories);

// Obtener una categoría específica por ID
router.get("/:id", categoryController.getCategoryById);

module.exports = router;