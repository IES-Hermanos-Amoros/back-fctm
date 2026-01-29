const documentModel = require("../models/documentManager.model")

//devolver documentos
exports.getAll = async() => //documentModel.find()
{
    const documents = await DocumentManager.find()
    .populate({
        path: "acciones_relacionadas", // virtual real de 1 nivel, esto sí existe
        select: "FCTM_action_title FCTM_action_type FCTM_action_notes FCTM_action_datetime FCTM_documents FCTM_created_by FCTM_updated_date"
    })
    .populate({
        path: "usuarios_relacionados", // populate al virtual User → Documents (como CV de alumno)
        select: "SAO_name SAO_profile SAO_email SAO_phone SAO_company_nameManager SAO_company_activity SAO_student_id"
    })
    .populate({
        path: "FCTM_document_created_by", //quién subió el documento
        model: "UserManager",
        select: "SAO_name SAO_profile SAO_email SAO_phone"
    })
    .lean()

    const actionIds = documents.flatMap(doc => doc.acciones_relacionadas.map(a => a._id))

    const users = await userManager.find({ FCTM_actions: { $in: actionIds } })
    .select("SAO_name SAO_profile SAO_email SAO_phone SAO_company_nameManager SAO_company_activity SAO_student_id FCTM_actions")
    .lean()

    const mapActionOwner = {}
    users.forEach(u => {
        u.FCTM_actions.forEach(aid => {
            mapActionOwner[aid.toString()] = {
                _id: u._id,
                SAO_name: u.SAO_name,
                SAO_profile: u.SAO_profile,
                SAO_email: u.SAO_email,
                SAO_phone: u.SAO_phone,
                SAO_company_nameManager: u.SAO_company_nameManager,
                SAO_company_activity: u.SAO_company_activity,
                SAO_student_id: u.SAO_student_id
            }
        })
    })

    documents.forEach(doc => {
        doc.acciones_relacionadas = doc.acciones_relacionadas.map(a => ({
            ...a,
            owner: mapActionOwner[a._id.toString()] || null // 👈 aquí va el usuario dueño
        }))
    })
    return documents
}

//devolver documento por su id
exports.getById = async (id) => documentModel.findById(id)

//crear nuevo documento
exports.create = async (datos) => {
    const newDocument = new documentModel(datos)
    return await newDocument.save()
}

//editar documento
exports.update = async (id, datos) => await documentModel.findByIdAndUpdate(id, datos, {new:true})

//eliminar documento
exports.remove = async (id) => await documentModel.findByIdAndDelete(id)