/**
 * TO DO
 * Implementar la lógica real de cada función utilizando consultas a MongoDB.
 * Cada función simula un resultado típico que podríamos obtener de la base de datos.
 * Asignar cada función a un alumno diferente para su implementación.
 * 
 * stats.service.js
 * 
 * Este servicio simula la obtención de datos de MongoDB.
 * Cada función puede ser asignada a un alumno diferente para 
 * implementar la lógica real
 */

//Gestión de histórico de convenios/**
const CompanyModel = require('../models/userManager.model'); 

// ==========================================
// 1. Gestión de histórico de convenios (REAL)
// ==========================================
exports.obtenerConvenios = async () => {
    try {
        const resultado = await CompanyModel.aggregate([
            // 1. Filtramos: que tenga perfil de empresa y que al menos una de las dos fechas SAO de convenio exista
            { 
                $match: { 
                    $or: [
                        { SAO_company_FCT_Date: { $exists: true, $ne: null } },
                        { SAO_company_FPDual_Date: { $exists: true, $ne: null } }
                    ]
                } 
            },
            
            // 2. Coalescencia: Priorizamos la fecha de FCT, si no existe usamos FP Dual
            {
                $project: {
                    fechaConvenio: { $ifNull: [ "$SAO_company_FCT_Date", "$SAO_company_FPDual_Date" ] }
                }
            },

            // 3. Extraemos el año y el mes de la fecha válida del convenio
            {
                $project: {
                    año: { $year: "$fechaConvenio" },
                    mes: { $month: "$fechaConvenio" }
                }
            },
            
            // 4. Calculamos el string del curso académico (Corte en Septiembre -> Mes 9)
            {
                $project: {
                    cursoAcademico: {
                        $cond: {
                            if: { $gte: ["$mes", 9] }, // Septiembre a Diciembre (Ej: Noviembre 2025 -> "25/26")
                            then: {
                                $concat: [
                                    { $substr: [{ $toString: "$año" }, 2, 2] },
                                    "/",
                                    { $substr: [{ $toString: { $add: ["$año", 1] } }, 2, 2] }
                                ]
                            },
                            else: { // Enero a Agosto (Ej: Febrero 2026 -> "25/26")
                                $concat: [
                                    { $substr: [{ $toString: { $subtract: ["$año", 1] } }, 2, 2] },
                                    "/",
                                    { $substr: [{ $toString: "$año" }, 2, 2] }
                                ]
                            }
                        }
                    }
                }
            },
            
            // 5. Agrupamos por el curso calculado y sumamos los registros
            {
                $group: {
                    _id: "$cursoAcademico",
                    total: { $sum: 1 }
                }
            },
            
            // 6. Ordenamos cronológicamente ("23/24", "24/25", etc.)
            { 
                $sort: { _id: 1 } 
            }
        ]);

        // 7. Formateamos la respuesta exacta que el FrontEnd necesita pintar
        return {
            labels: resultado.map(item => item._id),
            data: resultado.map(item => item.total)
        };

    } catch (err) {
        throw err;
    }
};
// ==========================================
// 2. Gestión de histórico de FCTs (MOCK)
// ==========================================
exports.obtenerFcts = async () => {
    // Simula una consulta a la colección 'fcts' agrupada por curso académico
    return {
        labels: ['21/22', '22/23', '23/24', '24/25', '25/26'],
        data: [120, 150, 140, 190, 210]
    };
};

// ==========================================
// 3. Análisis de demanda tecnológica (MOCK)
// ==========================================
exports.obtenerTopTecnologias = async () => {
    return [
        { name: 'React', value: 40 },
        { name: 'Node.js', value: 30 },
        { name: 'Python', value: 20 },
        { name: 'Java', value: 10 },
        { name: 'Ensamblador', value: 2 }
    ];
};

// ==========================================
// 4. Análisis de Soft Skills (MOCK)
// ==========================================
exports.obtenerHabilidades = async () => {
    return [
        { name: 'Trabajo Equipo', value: 35 },
        { name: 'Resolución Problemas', value: 25 },
        { name: 'Adaptabilidad', value: 20 },
        { name: 'Comunicación', value: 20 }
    ];
};

// ==========================================
// 5. Distribución geográfica del alumnado (MOCK)
// ==========================================
exports.obtenerLocalidades = async () => {
    return [
        { name: 'Villena', value: 45 },
        { name: 'Almansa', value: 25 },
        { name: 'Yecla', value: 18 },
        { name: 'Biar', value: 12 },
        { name: 'Caudete', value: 10 },
        { name: 'Alicante', value: 8 },
        { name: 'Elche', value: 5 }
    ];
};