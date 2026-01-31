const dummyService = require('../services/dummy.service');

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
    const newDummy = await dummyService.insertOne(req.body);
    res.status(201).json(newDummy);
  } catch (error) {
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

// =======================
// DELETE
// =======================

exports.deleteDummyById = async (req, res) => {
  try {
    const deletedDummy = await dummyService.deleteById(req.params.id);
    if (!deletedDummy) {
      return res.status(404).json({ error: 'Dummy no encontrado' });
    }
    res.status(200).json({ message: 'Dummy eliminado correctamente' });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ error: 'Formato de ID inválido' });
    }
    res.status(500).json({ error: 'Error al eliminar el dummy' });
  }
};
