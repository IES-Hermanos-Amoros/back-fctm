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
router.patch('/bulk-update', dummyController.bulkUpdateDummies); // NUEVO ENDPOINT PARA ACTUALIZACIÓN MASIVA

// Editar dummy por ID
router.put('/:id', dummyController.editDummyById);
// =======================
// DELETE
// =======================

// Eliminar dummy por ID
router.delete('/:id', dummyController.deleteDummyById);


//Dummy login ficticio /dummy/login
router.post('/login', dummyController.loginDummy)


module.exports = router;
