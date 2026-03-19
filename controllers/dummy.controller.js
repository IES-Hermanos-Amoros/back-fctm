require("dotenv").config();
const dummyService = require('../services/dummy.service');
//const jwt = require('jsonwebtoken');
const {createJWT} = require("../middlewares/jwt.mw")

// =======================
// GET ALL
// =======================

exports.getAllDummies = async (req, res) => {
  try {
    const dummies = await dummyService.findByFilter({});
    res.status(200).json(dummies);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los dummies' });
  }
};

// =======================
// GET BY ID
// =======================

exports.getDummyById = async (req, res) => {
  try {
    const dummy = await dummyService.findByFilter({ _id: req.params.id });
    if (!dummy || dummy.length === 0) {
      return res.status(404).json({ error: 'Dummy no encontrado' });
    }
    res.status(200).json(dummy[0]);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ error: 'Formato de ID inválido' });
    }
    res.status(500).json({ error: 'Error al obtener el dummy' });
  }
};

// =======================
// GET BY SAO_ID
// =======================

exports.getDummiesBySAOId = async (req, res) => {
  try {
    const dummies = await dummyService.findBySAOId(req.params.SAO_id);
    res.status(200).json(dummies);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los dummies por SAO_id' });
  }
};

// =======================
// CREATE
// =======================

exports.createDummy = async (req, res) => {
  try {
    console.log("DUMMY CREATE")
    console.log(req.body)
    const newDummy = await dummyService.insertOne(req.body);
    res.status(201).json(newDummy);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Error al crear el dummy' });
  }
};

// =======================
// UPDATE BY ID
// =======================

exports.editDummyById = async (req, res) => {

  console.log("EDIT DUMMY")
  console.log(req.body)

  try {
    const updatedDummy = await dummyService.update(req.params.id, req.body);
    if (!updatedDummy) {
      return res.status(404).json({ error: 'Dummy no encontrado' });
    }
    res.status(200).json(updatedDummy);
  } catch (error) {
    if (error.message && error.message.includes('no es válido')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error al actualizar el dummy' });
  }
};

// En dummy.controller.js
exports.bulkUpdateDummies = async (req, res) => {
  // Cambiamos 'update' por 'updates' para que coincida con el frontend si quieres, 
  // o lo mapeamos aquí:
  const { ids, updates } = req.body; 

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Se requiere un array de IDs' });
  }

  try {
    // IMPORTANTE: Pasar los dos argumentos por separado
    const result = await dummyService.bulkUpdate(ids, updates);
    
    res.status(200).json({ 
      success: true, // Importante para que tu utils/functions detecte éxito
      message: `${result.modifiedCount} registros actualizados correctamente` 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en la actualización masiva' });
  }
};

// =======================
// DELETE
// =======================

exports.deleteDummyById = async (req, res) => {
  try {
    console.log("ELIMINAR DUMMY")
    const deletedDummy = await dummyService.deleteById(req.params.id);
    if (!deletedDummy) {
      return res.status(404).json({ error: 'Dummy no encontrado' });
    }
    console.log(deletedDummy)
    res.status(200).json({ message: 'Dummy eliminado correctamente' });
  } catch (error) {
    console.log(error)
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ error: 'Formato de ID inválido' });
    }
    res.status(500).json({ error: 'Error al eliminar el dummy' });
  }
};


//LOGIN FICTICIO
exports.loginDummy = async(req,res,next) => {
    const { profile, username, id, SAO_id } = req.body;

    // Aquí "trampeamos" el payload del usuario
    const userPayload = {
        _id: id || '12345',
        username: username || 'usuario_de_prueba',
        SAO_id: SAO_id || 'SAO12345',
        profile: profile || 'STUDENT' // Por defecto estudiante
    };

    const token = createJWT(req,res,next,userPayload) //Creación del TOKEN y guardado en COOKIE "jwt" como httpOnly
    
    res.json({
        message: "Login ficticio exitoso",
        token
    });
}
