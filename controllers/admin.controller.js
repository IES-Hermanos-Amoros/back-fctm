const adminService = require('../services/admin.service')

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await adminService.getAllAdmins()
    res.status(200).json(admins)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los admins' })
  }
}

exports.getAdminById = async (req, res) => {
  try {
    const admin = await adminService.getAdminById(req.params.id)
    if (!admin) return res.status(404).json({ error: 'Admin no encontrado' })
    res.status(200).json(admin)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el admin' })
  }
}

exports.editAdmin = async (req, res) => {
  try {
    const updatedAdmin = await adminService.update(req.params.id, req.body)
    if (!updatedAdmin) res.status(404).json({ error: 'Admin no encontrado' })
    res.status(200).json(updatedAdmin)
  } catch (error) {
    res.status(500)({ error: 'Error al actualizar admin' })
  }
}
