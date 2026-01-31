const DummyModel = require('../models/dummy.model');

// =======================
// CONSULTAS
// =======================

const find = async () => {
    try {
        return await DummyModel.find();
    } catch (err) {
        throw err;
    }
};

const findByFilter = async (filter) => {
    try {
        return await DummyModel.find(filter);
    } catch (err) {
        throw err;
    }
};

const findBySAOId = async (SAO_id) => {
    try {
        return await DummyModel.find({ SAO_id });
    } catch (err) {
        throw err;
    }
};

// =======================
// INSERCIÓN
// =======================

const insertOne = async (dummyData) => {
    try {
        const dummy = new DummyModel(dummyData);
        return await dummy.save();
    } catch (err) {
        throw err;
    }
};

const insertMany = async (dummyDataList) => {
    try {
        return await DummyModel.insertMany(dummyDataList);
    } catch (err) {
        throw err;
    }
};

// =======================
// INSERCIÓN + ACTUALIZACIÓN MASIVA
// =======================

/*
    dummyDataListToInsert -> array de nuevos registros
    dummyDataListToUpdate -> array con esta estructura:
    {
        _id, // o cualquier campo identificador
        MODIFIED_FIELDS: [
            { field: "FCTM_dummy_description", value: "texto nuevo" }
        ]
    }
*/
const insertUpdateMany = async (dummyDataListToInsert, dummyDataListToUpdate) => {
    try {
        const operations = [];

        // Inserciones
        if (dummyDataListToInsert && dummyDataListToInsert.length > 0) {
            operations.push(DummyModel.insertMany(dummyDataListToInsert));
        }

        // Actualizaciones
        if (dummyDataListToUpdate && dummyDataListToUpdate.length > 0) {
            const bulkOps = dummyDataListToUpdate.map(dummy => {
                const updateFields = {};

                dummy.MODIFIED_FIELDS.forEach(item => {
                    if (
                        item.field &&
                        item.value !== undefined &&
                        item.value !== null
                    ) {
                        updateFields[item.field] = item.value;
                    }
                });

                updateFields.FCTM_updated_date = new Date();

                return {
                    updateOne: {
                        filter: { _id: dummy._id },
                        update: { $set: updateFields },
                        upsert: false
                    }
                };
            });

            operations.push(DummyModel.bulkWrite(bulkOps));
        }

        const results = await Promise.all(operations);

        return {
            insertResult: results[0] || null,
            updateResult: results[1] || null
        };

    } catch (err) {
        throw err;
    }
};

const update = async (id, data) => {
  try {
    return await DummyModel.findByIdAndUpdate(
      id,
      data,
      {
        new: true,          // devuelve el documento actualizado
        runValidators: true // valida el schema
      }
    );
  } catch (err) {
    throw err;
  }
};

// =======================
// BORRADO
// =======================

const deleteById = async (id) => {
    try {
        return await DummyModel.findByIdAndDelete(id);
    } catch (err) {
        throw err;
    }
};

const deleteBySAOId = async (SAO_id) => {
    try {
        return await DummyModel.deleteMany({ SAO_id });
    } catch (err) {
        throw err;
    }
};

// =======================
// EXPORTS
// =======================

module.exports = {
    find,
    findByFilter,
    findBySAOId,
    insertOne,
    insertMany,
    insertUpdateMany,
    update,
    deleteById,
    deleteBySAOId
};
