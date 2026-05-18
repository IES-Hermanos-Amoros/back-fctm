const fctManager = require('../models/fctManager.model')
const Skill = require('../models/skillManager.model')

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
const JobOfferManager = require("../models/jobOfferManager.model");

//Gestión de histórico de convenios
exports.obtenerConvenios = async () => {
    // Simula una consulta con: .aggregate([{ $group: { _id: "$curso", count: { $sum: 1 } } }])
    return {
        labels: ['21/22', '22/23', '23/24', '24/25', '25/26', '26/27'],
        data: [80, 110, 95, 130, 154, 180, 0]
    };
};

//Carolina
//Gestión de histórico de FCTs
exports.obtenerFcts = async () => {
    try {
        // Agrupamos las FCTs usando el campo real 'SAO_period'
        const fctsPorPeriodo = await fctManager.aggregate([
            {
                $match: { 
                    SAO_period: { $ne: null, $exists: true } 
                }
            },
            {
                $group: {
                    _id: "$SAO_period", 
                    count: { $sum: 1 }   
                }
            },
            { 
                $sort: { _id: 1 } 
            }
        ]);

        // Mapeamos los resultados para estructurar la respuesta esperada por tu frontend
        const labels = fctsPorPeriodo.map(item => item._id);
        const data = fctsPorPeriodo.map(item => item.count);

        return { labels, data };

    } catch (error) {
        console.error("Error en stats.service -> obtenerFcts:", error);
        throw new Error("No se pudieron recopilar las estadísticas de las FCTs");
    }
};

//Análisis de demanda tecnológica
exports.obtenerTopTecnologias = async () => {
    const offers = await JobOfferManager.find({}, "FCTM_skills")
        .populate({
            path: "FCTM_skills",
            select: "FCTM_skill_name FCTM_skill_verified",
        })
        .lean();

    const countsBySkillName = new Map();

    for (const offer of offers) {
        if (!Array.isArray(offer.FCTM_skills)) continue;

        // Evita duplicar una misma skill dentro de la misma oferta.
        const uniqueVerifiedNamesInOffer = new Set();

        for (const skill of offer.FCTM_skills) {
            if (!skill || skill.FCTM_skill_verified !== true) continue;
            if (!skill.FCTM_skill_name) continue;

            const normalizedName = String(skill.FCTM_skill_name).trim();
            if (!normalizedName) continue;

            uniqueVerifiedNamesInOffer.add(normalizedName);
        }

        for (const skillName of uniqueVerifiedNamesInOffer) {
            countsBySkillName.set(
                skillName,
                (countsBySkillName.get(skillName) || 0) + 1
            );
        }
    }

    return [...countsBySkillName.entries()]
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => (b.value - a.value) || a.name.localeCompare(b.name))
        .slice(0, 4);
};

//Carolina
//Análisis de Soft Skills
exports.obtenerHabilidades = async () => {
    try {
        // Consultamos el catálogo de habilidades ordenando por su contador de uso acumulativo
        const habilidadesPopulares = await Skill.find({
            FCTM_skill_usage_count: { $gt: 0 } 
        })
        .sort({ FCTM_skill_usage_count: -1 }) 
        .limit(8)  //Limite de habilidades que se van a mostrar en el grafico                          
        .lean();                              

        // Transformamos los campos nativos (FCTM_skill_name, FCTM_skill_usage_count) al formato de la gráfica (name, value)
        return habilidadesPopulares.map(skill => ({
            name: skill.FCTM_skill_name,
            value: skill.FCTM_skill_usage_count
        }));

    } catch (error) {
        console.error("Error en stats.service -> obtenerHabilidades:", error);
        throw new Error("No se pudieron recopilar las estadísticas de habilidades");
    }
};

//Distribución geográfica del alumnado
exports.obtenerLocalidades = async () => {
    // Simula: .aggregate([{ $group: { _id: "$localidad", value: { $sum: 1 } } }])
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
