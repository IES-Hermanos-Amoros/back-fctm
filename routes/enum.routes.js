const express = require("express")
const router = express.Router()
const enumController = require("../controllers/enum.controller")

//1º ruta - getAll
router.get('/', enumController.getAll)

//2º ruta - getEnumByName
router.get('/:name', enumController.getEnumByName)