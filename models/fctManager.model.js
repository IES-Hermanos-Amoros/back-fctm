const mongoose = require('mongoose');
const userManager = require('./userManager.model'); // asegúrate de que está bien importado

const Schema = mongoose.Schema;

const fctManagerSchema = new Schema({
    SAO_fct_id: { type: String, unique: true, required: true },
    SAO_student_course: { type: String },
    SAO_student_id: { type: String, required: true }, // NIA
    SAO_company_id: { type: String, required: true }, // CIF
    SAO_workcenter_name: { type: String },
    SAO_workcenter_phone: { type: String },
    SAO_workcenter_manager: { type: String },
    SAO_workcenter_manager_id: { type: String },
    SAO_workcenter_city: { type: String },
    SAO_workcenter_email: { type: String },
    SAO_teacher_id: { type: String, required: true }, // NIF
    SAO_instructor_name: { type: String },
    SAO_instructor_id: { type: String },
    SAO_period: { type: String },
    SAO_dates: { type: String },
    SAO_schedule: { type: String },
    SAO_hours: { type: String },
    SAO_department: { type: String },
    SAO_type: { type: String },
    SAO_Authorization: { type: String },
    SAO_Erasmus: { type: String },
    SAO_termination_date: { type: Date },
    SAO_instructor_assessment: { type: String },
    SAO_observation: { type: String },
    SAO_variation: { type: String },
    SAO_link: { type: String },
    SAO_amount: { type: String },
    // Campos nuevos personalizados
    FCTM_inserted_date: { type: Date, default: Date.now },
    FCTM_updated_date: { type: Date, default: Date.now }
});

// Middleware para actualizar FCTM_updated_date antes de cada save
fctManagerSchema.pre('save', function (next) {
    this.FCTM_updated_date = new Date();
    if (this.isNew) {
        this.FCTM_inserted_date = new Date();
    }
    next();
});

// Middleware para findOneAndUpdate y similares
fctManagerSchema.pre('findOneAndUpdate', function (next) {
    this.set({ FCTM_updated_date: new Date() });
    next();
});

const fctManager = mongoose.model('fctManager', fctManagerSchema);

fctManager.findByFilter = async(filter) => {
    const fctList = await fctManager.find(filter)
    return fctList
}


fctManager.insertUpdateManyFCT = async function (fctDataListToInsert, fctDataListToUpdate, result) {
    try {
        const validInserts = [];
        const failedInserts = [];

        // Validamos cada FCT antes de insertar
        for (const fct of fctDataListToInsert) {
            const idsToCheck = [
                { type: 'student', id: fct.SAO_student_id },
                { type: 'teacher', id: fct.SAO_teacher_id },
                { type: 'company', id: fct.SAO_company_id }
            ];

            const missingIds = [];

            for (const item of idsToCheck) {
                const found = await userManager.findByFilter({ SAO_id: item.id });
                if (!found || found.length === 0) {
                    missingIds.push(`el campo ${item.type} (${item.id}) no existe en BBDD`);
                }
            }

            if (missingIds.length > 0) {
                failedInserts.push({
                    SAO_fct_id: fct.SAO_fct_id,
                    reason: `No se ha podido insertar la FCT con ID ${fct.SAO_fct_id} porque ${missingIds.join(', ')}.`
                });
            } else {
                validInserts.push(fct);
            }
        }

        // Ejecutamos inserciones y actualizaciones en paralelo
        const [insertResult, updateResult] = await Promise.all([
            fctManager.insertMany(validInserts),
            fctManager.bulkWrite(
                fctDataListToUpdate.map(fct => {
                    const updateFields = {};
                    fct.SAO_MODIFIED_FIELDS.forEach(campo => {
                        if (campo.field && campo.SAO_Value) {
                            updateFields[campo.field] = campo.SAO_Value;
                        }
                    });

                    // Aquí añadimos la fecha de actualización
                    updateFields.FCTM_updated_date = new Date();

                    return {
                        updateOne: {
                            filter: { SAO_fct_id: fct.SAO_fct_id },
                            update: { $set: updateFields },
                            upsert: false
                        }
                    };
                })
            )
        ]);

        result(null, {
            insertResult,
            updateResult,
            failedInserts
        });
    } catch (err) {
        result(err, null);
    }
};

module.exports = fctManager;
