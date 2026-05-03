const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');

/**
 * @route   GET /stats
 * @desc    Obtener todas las estadísticas consolidadas para el dashboard
 * @access  Privado (Profesorado / Administradores)
 */
router.get('/', statsController.getDashboardStats);

module.exports = router;