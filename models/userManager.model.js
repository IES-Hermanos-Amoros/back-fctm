const mongoose = require('mongoose');

const userManagerSchema = new mongoose.Schema({
    SAO_id: { type: String, unique: true, required: true },
    SAO_profile: {
        type:String,
        required:false,
        enum: ["ADMINISTRADOR","PROFESOR","ALUMNO","EMPRESA"],
        default:null
    },
    SAO_username: String,
    SAO_registryDate: Date,
    SAO_accessDate: Date,
    SAO_name: String,
    SAO_organization: String,
    SAO_group: String,
    SAO_email: String,
    SAO_phone: String,

    SAO_student_id: String,
    SAO_student_socialNumber: String,
    SAO_student_city: String,
    SAO_student_state: String,
    SAO_student_codeState: String,
    SAO_student_address: String,
    SAO_student_gender: String,
    SAO_student_visibleCompanies: String,

    SAO_company_FCT_Number: String,
    SAO_company_FCT_Date: Date,
    SAO_company_FPDual_Number: String,
    SAO_company_FPDual_Date: Date,
    SAO_company_fax: String,
    SAO_company_city: String,
    SAO_company_state: String,
    SAO_company_codeState: String,
    SAO_company_address: String,
    SAO_company_activity: String,
    SAO_company_nameManager: String,
    SAO_company_idManager: String,
    SAO_company_notaryState: String,
    SAO_company_notaryCity: String,
    SAO_company_notaryName: String,
    SAO_company_protocolNumber: String,
    SAO_company_deedDate: Date,

    // Campos nuevos personalizados (generales, para todo tipo de usuario)
    FCTM_inserted_date: { type: Date, default: Date.now },
    FCTM_updated_date: { type: Date, default: Date.now },

    // Campos nuevos personalizados para EMPRESAS
    FCTM_company_category: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        default: []
    }],
    FCTM_company_observations: String,
    FCTM_company_other_contact: String,
    FCTM_company_openToHire: { type: Boolean, default: false },

    // Campos nuevos personalizados para PROFESORES
    FCTM_teacher_observations: String,
    FCTM_teacher_other_contact: String,

    // Campos nuevos personalizados para ALUMNOS
    FCTM_student_observations: String,
    FCTM_student_other_contact: String,
    FCTM_student_openToWork: { type: Boolean, default: false },

    //RELACIONES con OTROS MODELOS
    FCTM_actions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "ActionManager", // Relación con las acciones
        default: []
    }],
    
    FCTM_documents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "DocumentManager", // Relación con los documentos
        default: []
    }],

    FCTM_job_offers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "JobOfferManager", // Relación con las ofertas de trabajo
        default: []
    }],

    FCTM_reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "ReviewManager", // Relación con las reseñas
        default: []
    }],

    //En el SHOW de una empresa, alumno y profesor... mostraremos el listado de FCTs filtrando por SAO_id = (SAO_student_id, SAO_company_id o SAO_teacher_id según proceda)
    /*FCTM_fcts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "fctManager", // Relación con las FCT
        default: []
    }],*/


});

// Middleware para actualizar FCTM_updated_date antes de cada save
userManagerSchema.pre('save', function (next) {
    this.FCTM_updated_date = new Date();
    if (this.isNew) {
        this.FCTM_inserted_date = new Date();
    }
    next();
});

// Middleware para findOneAndUpdate y similares
userManagerSchema.pre('findOneAndUpdate', function (next) {
    this.set({ FCTM_updated_date: new Date() });
    next();
});

const userManager = mongoose.model('userManager', userManagerSchema);

userManager.findByFilter = async(filter) => {
    const usersList = await userManager.find(filter)
    return usersList
}

userManager.insertManyUsers = async function(userDataList, result){    
    await userManager.insertMany(userDataList)
        .then((datos)=>{
            result(null,datos)
        })
        .catch((err)=>{
            result(err,null)
        })
}


userManager.insertUpdateManyUsers = async function(userDataListToInsert, userDataListToUpdate, result) {
    try {
        // Ejecutamos ambas operaciones en paralelo con Promise.all
        const [insertResult, updateResult] = await Promise.all([
            userManager.insertMany(userDataListToInsert),  // Operación de inserción
            userManager.bulkWrite(
                userDataListToUpdate.map(user => {
                    // Para cada usuario en el array, construimos la operación de actualización
                    const updateFields = {};

                    // Recorremos los campos modificados y los agregamos a la actualización
                    user.SAO_MODIFIED_FIELDS.forEach(campo => {
                        if (campo.field && campo.SAO_Value) {
                            updateFields[campo.field] = campo.SAO_Value;
                        }
                    });
                    // Aquí añadimos la fecha de actualización
                    updateFields.FCTM_updated_date = new Date();

                    return {
                        updateOne: {
                            filter: { SAO_id: user.SAO_id }, // Filtramos por SAO_id
                            update: { $set: updateFields },  // Establecemos los campos modificados
                            upsert: false // Si no se encuentra el documento, no lo insertamos
                        }
                    };
                })
            )
        ]);

        // Devolvemos ambos resultados en un solo objeto
        const datos = {
            insertResult,
            updateResult
        };

        // Retornamos el resultado con ambos objetos
        result(null, datos);
    } catch (err) {
        // Si ocurre un error, lo manejamos aquí
        result(err, null);
    }
};




 

module.exports = userManager;
