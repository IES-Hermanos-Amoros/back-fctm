const express = require('express');
const router = express.Router();

const dummyController = require('../controllers/dummy.controller');

// =======================
// GET
// =======================

// Obtener todos los dummies
router.get('/', dummyController.getAllDummies);

// Obtener dummy por ID
router.get('/:id', dummyController.getDummyById);


// =======================
// POST
// =======================

// Crear nuevo dummy
router.post('/', dummyController.createDummy);

// =======================
// PUT
// =======================

// Editar dummy por ID
router.put('/:id', dummyController.editDummyById);

// =======================
// DELETE
// =======================

// Eliminar dummy por ID
router.delete('/:id', dummyController.deleteDummyById);

module.exports = router;
