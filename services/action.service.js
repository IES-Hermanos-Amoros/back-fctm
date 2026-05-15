const actionModel = require("../models/actionManager.model")
const userModel = require("../models/userManager.model")
const { insertManyDocuments } = require("./document.service")


//Obtener todas las acciones
exports.getAll = () => actionModel.find()

//Obtener accion por id
exports.getById = async(id) => actionModel.findById(id).populate('FCTM_documents')

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

    console.log(files)

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
exports.update = async(id,datos) => await actionModel.findByIdAndUpdate(id,datos, {new:true})

//Eliminar accion
exports.remove = async(id) => await actionModel.findByIdAndDelete(id)