const fctManager = require("../models/fctManager.model");
const userManager = require("../models/userManager.model");

// 1. Listar todas las FCTs enriquecidas
exports.findAll = async (user) => {
  try {
    // 1. Obtenemos todas las FCTs
    const fcts = await fctManager.find({}).lean(); 
    // .lean() es clave aquí para que nos devuelva objetos JS planos y sea más rápido

    if (fcts.length === 0) return [];

    let filteredFcts = fcts;

    if (!["ADMINISTRADOR", "PROFESOR"].includes(user.profile)) {
      filteredFcts = fcts.filter(fct => {
        return (
          fct.SAO_student_id === user.SAO_id ||
          fct.SAO_company_id === user.SAO_id
        );
      });
    }

    // 2. Extraemos todos los IDs únicos (estudiantes, empresas y profesores) 
    // para hacer una sola consulta a la base de datos de usuarios
    const studentIds = [...new Set(filteredFcts.map(f => f.SAO_student_id))];
    const teacherIds = [...new Set(filteredFcts.map(f => f.SAO_teacher_id))];
    const companyIds = [...new Set(filteredFcts.map(f => f.SAO_company_id))];

    const allUserIds = [...new Set([...studentIds, ...teacherIds, ...companyIds])];

    // 3. Buscamos todos los usuarios involucrados de una sola vez
    const users = await userManager.find({
      SAO_id: { $in: allUserIds }
    }).lean();

    // 4. Creamos un mapa (diccionario) para buscar usuarios por SAO_id en tiempo constante O(1)
    const userMap = users.reduce((acc, user) => {
      acc[user.SAO_id] = user;
      return acc;
    }, {});

    // 5. Cruzamos los datos
    const enrichedFcts = filteredFcts.map(fct => {
      const student = userMap[fct.SAO_student_id];
      const teacher = userMap[fct.SAO_teacher_id];
      const company = userMap[fct.SAO_company_id];

      return {
        _id: fct._id,
        // Datos originales de la FCT
        SAO_fct_id: fct.SAO_fct_id,
        SAO_student_id: fct.SAO_student_id, // NIA
        
        // Datos enriquecidos del Alumno
        SAO_student_fullname: student ? student.SAO_name : "No encontrado",
        
        // Datos enriquecidos de la Empresa
        SAO_company_name: company ? company.SAO_name : "No encontrada",
        SAO_company_city: company ? company.SAO_company_city : "No definida",
        SAO_company_center_name: fct.SAO_workcenter_name,
        
        // Datos enriquecidos del Profesor
        SAO_teacher_fullname: teacher ? teacher.SAO_name : "No encontrado",
        
        // Otros campos que necesites
        SAO_dates: fct.SAO_dates,
        SAO_hours: fct.SAO_hours,
        // Puedes añadir aquí el "número de convenio" si es SAO_company_FCT_Number u otro
        SAO_instructor_name: fct.SAO_instructor_name,
        SAO_period: fct.SAO_period,
        FCTM_ies_instructor: fct.FCTM_ies_instructor ? fct.FCTM_ies_instructor: teacher ? teacher.SAO_name : "No asignado"
      };
    });

    return enrichedFcts;

  } catch (error) {
    console.error("Error en fctService.findAll:", error);
    throw new Error("Error al recuperar y enriquecer las FCTs");
  }

  /*    
    SAO_student_id --> NIA
    SAO_student_fullname --> Alumno
    SAO_company_name --> Empresa
    SAO_company_city --> Localidad
    SAO_company_center_name --> Centro de Trabajo    
    SAO_instructor_name --> Instructor Empresa
    SAO_teacher_fullname --> Tutor Curso
    FCTM_ies_instructor --> Tutor IES
    SAO_dates --> Fechas
    SAO_hours --> Horas    
    SAO_period --> Curso / Periodo
  */

};



// 1. Listar todas las FCTs 
exports.findAll_old = async () => {
  try {
    // .find({}) vacío para que traiga todos los registros
    const fcts = await fctManager.find({}).sort({ id: 1 });
    return fcts;
  } catch (error) {
    console.error("Error en fctService.findAll:", error);
    throw new Error("Error al recuperar todas las FCTs");
  }
};

// 2. Buscar por ID y devolver enriquecido
exports.findById = async (id, user) => {
  try {
    // 1. Buscamos la FCT con las reseñas populadas
    const fct = await fctManager.findOne({ _id: id })
      .populate({
        path: 'FCTM_reviews',
        options: { sort: { FCTM_review_date: -1 } },
        populate: {
          path: 'FCTM_user_id',
          select: 'SAO_name'
        }
      })
      .lean();

    // 2. Asegurar que FCTM_documents existe y poblar documentos
    if (fct) {
      const documentModel = require('../models/documentManager.model');
      // Si no tiene el campo o es null, inicializar como array vacío
      if (!fct.FCTM_documents) {
        fct.FCTM_documents = [];
      }
      // Si tiene documentos, poblarlos
      if (fct.FCTM_documents.length > 0) {
        const documents = await documentModel.find({
          _id: { $in: fct.FCTM_documents }
        }).select('FCTM_document_name FCTM_document_type FCTM_document_url FCTM_inserted_date').lean();
        fct.FCTM_documents = documents;
      }
    }
    
    if (!fct) return null;

    if (!["ADMINISTRADOR", "PROFESOR"].includes(user.profile)) {
      const isOwner =
        fct.SAO_student_id === user.SAO_id ||
        fct.SAO_company_id === user.SAO_id;

      if (!isOwner) return null;
    }

    // 2. Recolectamos los IDs necesarios
    const userIds = [
      fct.SAO_student_id,
      fct.SAO_teacher_id,
      fct.SAO_company_id
    ].filter(Boolean); // Filtramos por si alguno fuera nulo

    // 3. Buscamos los usuarios asociados
    const users = await userManager.find({
      SAO_id: { $in: userIds }
    }).lean();

    // 4. Creamos el mapa para acceso rápido
    const userMap = users.reduce((acc, user) => {
      acc[user.SAO_id] = user;
      return acc;
    }, {});

    // 5. Construimos el objeto enriquecido manteniendo todos los campos originales
    const student = userMap[fct.SAO_student_id];
    const teacher = userMap[fct.SAO_teacher_id];
    const company = userMap[fct.SAO_company_id];

    // Filtramos las reseñas que fueron populadas (las no verificadas vendrán como null)
    const verifiedReviews = (fct.FCTM_reviews || []).filter(r => r !== null);

    return {
      ...fct, // spread operator para incluir todos los campos originales
      FCTM_reviews: verifiedReviews, // Usamos las reseñas ya populadas y filtradas
      SAO_student_fullname: student ? student.SAO_name : "No encontrado",
      SAO_company_name: company ? company.SAO_name : "No encontrada",
      SAO_company_city: company ? company.SAO_company_city : "No definida",
      SAO_company_center_name: fct.SAO_workcenter_name,
      SAO_teacher_fullname: teacher ? teacher.SAO_name : "No encontrado",
      // Campo calculado adicional si es necesario
      FCTM_ies_instructor: fct.FCTM_ies_instructor || (teacher ? teacher.SAO_name : "No asignado")
    };

  } catch (error) {
    console.error("Error en fctService.findById:", error);
    throw new Error("Error al buscar y enriquecer la FCT");
  }
};

/*
  SAO_fct_id --> ID FCT
  SAO_student_course --> Curso Alumno
  SAO_student_id --> NIA
  SAO_student_fullname --> Alumno
  SAO_company_id --> CIF Empresa
  SAO_company_name --> Empresa
  SAO_company_city --> Localidad
  SAO_workcenter_name --> Centro de Trabajo
  SAO_workcenter_phone --> Teléfono Centro
  SAO_workcenter_manager --> Responsable Centro
  SAO_workcenter_manager_id --> ID Responsable Centro
  SAO_workcenter_email --> Email Centro
  SAO_teacher_id --> NIF Profesor
  SAO_teacher_fullname --> Tutor Curso
  SAO_instructor_id --> ID Instructor Empresa
  SAO_instructor_name --> Instructor Empresa
  SAO_period --> Curso / Periodo
  SAO_dates --> Fechas
  SAO_schedule --> Horario
  SAO_hours --> Horas
  SAO_department --> Departamento
  SAO_type --> Tipo FCT
  SAO_Authorization --> Autorización
  SAO_Erasmus --> Erasmus
  SAO_termination_date --> Fecha Finalización
  SAO_instructor_assessment --> Valoración Instructor
  SAO_observation --> Observaciones
  SAO_variation --> Variación
  SAO_link --> Enlace
  SAO_amount --> Importe
  FCTM_notes --> Notas Internas
  FCTM_ies_instructor --> Tutor IES
 */

// 2. Buscar por ID (Cualquier FCT)
exports.findById_old = async (id) => {
  try {
    const fct = await fctManager.findOne({ _id: id });
    return fct;
  } catch (error) {
    console.error("Error en fctService.findById:", error);
    throw new Error("Error al buscar la FCT en la base de datos");
  }
};

// 3. Editar SOLO campos FCTM_ 
// Bloquea cualquier intento de modificar campos que empiecen por SAO_
exports.updateFctmFields = async (id, data) => {
  try {
    const filteredData = {};

    // Filtro estricto: Solo pasan los campos que empiezan por FCTM_
    Object.keys(data).forEach((key) => {
      if (key.startsWith("FCTM_")) {
        filteredData[key] = data[key];
      }
    });

    if (Object.keys(filteredData).length === 0) {
      throw new Error("No se han enviado campos FCTM_ válidos para editar");
    }

    // Actualización segura
    console.log("datos filtrados: " , filteredData, id)

    const updatedFct = await fctManager.findOneAndUpdate(
      { _id: id },
      { $set: filteredData },
      { new: true, runValidators: true }
    );

    if (!updatedFct) throw new Error("FCT no encontrada");

    return updatedFct;
  } catch (error) {
    console.error("Error en fctService.updateFctmFields:", error);
    throw error;
  }
};