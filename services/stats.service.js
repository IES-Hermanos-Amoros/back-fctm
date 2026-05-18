const fctManager = require('../models/fctManager.model')
const Skill = require('../models/skillManager.model')
const UserManager = require('../models/userManager.model')
const JobOfferManager = require('../models/jobOfferManager.model')

// 1. Gestion de historico de convenios (Asier)
exports.obtenerConvenios = async () => {
  const resultado = await UserManager.aggregate([
    {
      $match: {
        SAO_profile: 'EMPRESA',
        $or: [
          { SAO_company_FCT_Date: { $exists: true, $ne: null } },
          { SAO_company_FPDual_Date: { $exists: true, $ne: null } }
        ]
      }
    },
    {
      $project: {
        fechaConvenio: { $ifNull: ['$SAO_company_FCT_Date', '$SAO_company_FPDual_Date'] }
      }
    },
    {
      $project: {
        anio: { $year: '$fechaConvenio' },
        mes: { $month: '$fechaConvenio' }
      }
    },
    {
      $project: {
        cursoAcademico: {
          $cond: {
            if: { $gte: ['$mes', 9] },
            then: {
              $concat: [
                { $substr: [{ $toString: '$anio' }, 2, 2] },
                '/',
                { $substr: [{ $toString: { $add: ['$anio', 1] } }, 2, 2] }
              ]
            },
            else: {
              $concat: [
                { $substr: [{ $toString: { $subtract: ['$anio', 1] } }, 2, 2] },
                '/',
                { $substr: [{ $toString: '$anio' }, 2, 2] }
              ]
            }
          }
        }
      }
    },
    {
      $group: {
        _id: '$cursoAcademico',
        total: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ])

  return {
    labels: resultado.map(item => item._id),
    data: resultado.map(item => item.total)
  }
}

// 2. Gestion de historico de FCTs (Carolina)
exports.obtenerFcts = async () => {
  const fctsPorPeriodo = await fctManager.aggregate([
    {
      $match: {
        SAO_period: { $ne: null, $exists: true }
      }
    },
    {
      $group: {
        _id: '$SAO_period',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ])

  return {
    labels: fctsPorPeriodo.map(item => item._id),
    data: fctsPorPeriodo.map(item => item.count)
  }
}

// 3. Analisis de demanda tecnologica (Cristian)
exports.obtenerTopTecnologias = async () => {
  const offers = await JobOfferManager.find({}, 'FCTM_skills')
    .populate({
      path: 'FCTM_skills',
      select: 'FCTM_skill_name FCTM_skill_verified'
    })
    .lean()

  const countsBySkillName = new Map()

  for (const offer of offers) {
    if (!Array.isArray(offer.FCTM_skills)) continue

    const uniqueVerifiedNamesInOffer = new Set()

    for (const skill of offer.FCTM_skills) {
      if (!skill || skill.FCTM_skill_verified !== true) continue
      if (!skill.FCTM_skill_name) continue

      const normalizedName = String(skill.FCTM_skill_name).trim()
      if (!normalizedName) continue

      uniqueVerifiedNamesInOffer.add(normalizedName)
    }

    for (const skillName of uniqueVerifiedNamesInOffer) {
      countsBySkillName.set(
        skillName,
        (countsBySkillName.get(skillName) || 0) + 1
      )
    }
  }

  return [...countsBySkillName.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => (b.value - a.value) || a.name.localeCompare(b.name))
    .slice(0, 4)
}

// 4. Analisis de Soft Skills (Carolina)
exports.obtenerHabilidades = async () => {
  const habilidadesPopulares = await Skill.find({
    FCTM_skill_usage_count: { $gt: 0 }
  })
    .sort({ FCTM_skill_usage_count: -1 })
    .limit(8)
    .lean()

  return habilidadesPopulares.map(skill => ({
    name: skill.FCTM_skill_name,
    value: skill.FCTM_skill_usage_count
  }))
}

// 5. Distribucion geografica del alumnado (Daniel)
exports.obtenerLocalidades = async () => {
  const resultado = await UserManager.aggregate([
    {
      $match: {
        SAO_profile: 'ALUMNO',
        SAO_student_city: { $exists: true, $nin: [null, ''] }
      }
    },
    {
      $group: {
        _id: '$SAO_student_city',
        value: { $sum: 1 }
      }
    },
    {
      $sort: { value: -1 }
    }
  ])

  return resultado.map(item => ({
    name: item._id,
    value: item.value
  }))
}
