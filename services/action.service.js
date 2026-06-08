const actionModel = require("../models/actionManager.model")
const userModel = require("../models/userManager.model")
const { insertManyDocuments } = require("./document.service")


//Obtener todas las acciones
exports.getAll = () => actionModel.find().populate({
      path: 'FCTM_created_by',
      model: 'UserManager',
      select: 'SAO_name SAO_profile SAO_email SAO_phone',
    })

//Obtener accion por id
exports.getById = async(id) => actionModel.findById(id).populate('FCTM_documents').populate({
      path: 'FCTM_created_by',
      model: 'UserManager',
      select: 'SAO_name SAO_profile SAO_email SAO_phone',
    })

//Crear una nueva accion
exports.create = async({
    FCTM_action_title,
    FCTM_action_type,
    FCTM_action_datetime,
    FCTM_action_notes,
    FCTM_created_by,
    user_Id},
    files = []
    ) => {
        //ERROR en el paso de parámetros --> El cierre } estaba después de files = [] y no antes, como debe ser

    let filesID

    const datosDocumentos = {
        description: FCTM_action_title,
        type: "OTRO",
        createdBy: FCTM_created_by,
        visible_to_profiles: ["ADMINISTRADOR", "PROFESOR"]
    }

    if(files && files.length > 0){
        filesID = await insertManyDocuments(files, datosDocumentos)
    }

    const newAction = new actionModel({
        FCTM_action_title,
        FCTM_action_type,
        FCTM_action_datetime,
        FCTM_action_notes,
        FCTM_created_by,
        FCTM_documents: filesID,
    })
    
    if(user_Id){
        await userModel.updateOne(
            { _id: user_Id},
            { $push: {FCTM_actions: newAction._id}}
        )
    }

    return await newAction.save()
}

//Editar accion
//Editar accion al estilo del create
exports.update = async (id, datos, files = []) => {
    let filesID = [];

    // 1. Si vienen archivos nuevos, los procesamos e insertamos
    if (files && files.length > 0) {
        const datosDocumentos = {
            description: datos.FCTM_action_title || "Documento de Acción",
            type: "OTRO",
            createdBy: datos.FCTM_created_by,
            visible_to_profiles: ["ADMINISTRADOR", "PROFESOR"]
        };

        filesID = await insertManyDocuments(files, datosDocumentos);
    }

    // 2. Preparamos el objeto de actualización de Mongo
    const updateQuery = {
        $set: datos // Actualiza campos de texto, fechas, etc.
    };

    // 3. Si se generaron nuevos IDs de documentos, los añadimos al array existente con $each
    if (filesID && filesID.length > 0) {
        updateQuery.$push = {
            FCTM_documents: { $each: filesID }
        };
    }

    // Aseguramos que no se intente sobreescribir el array completo por error en el $set
    if (updateQuery.$set.FCTM_documents) {
        delete updateQuery.$set.FCTM_documents;
    }

    // 4. Ejecutamos la actualización y devolvemos el documento actualizado y populado
    await actionModel.updateOne({ _id: id }, updateQuery);
    
    return await actionModel.findById(id).populate('FCTM_documents');
};

//Eliminar accion
exports.remove = async(id) => await actionModel.findByIdAndDelete(id)