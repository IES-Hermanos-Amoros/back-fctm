const StatsService = require('../services/stats.service');

/**
 * Obtiene todas las estadísticas para el dashboard.
 * Coordina las llamadas a las distintas funciones del servicio
 * y las une en un único objeto de respuesta.
 */
exports.getDashboardStats = async (req, res) => {
    try {
        // Ejecución en paralelo: Todas las promesas arrancan al mismo tiempo.
        // El orden de las variables en el array de la izquierda debe coincidir 
        // con el orden de las funciones en el array de la derecha.
        const [
            convenios, 
            fcts, 
            tecnologias, 
            habilidades, 
            localidades
        ] = await Promise.all([
            StatsService.obtenerConvenios(),
            StatsService.obtenerFcts(),
            StatsService.obtenerTopTecnologias(),
            StatsService.obtenerHabilidades(),
            StatsService.obtenerLocalidades()
        ]);

        // Construcción del objeto de respuesta siguiendo el contrato acordado con el Front
        res.status(200).json({
            success: true,
            data: {
                conveniosPorCurso: convenios,
                fctPorCurso: fcts,
                tecnologiasDemandadas: tecnologias,
                habilidadesAlumnos: habilidades,
                alumnadoPorLocalidad: localidades
            }
        });

    } catch (error) {
        console.error("Error en getDashboardStats:", error);

        // Si falla alguna de las promesas de arriba, Promise.all lanzará una excepción.
        res.status(500).json({
            success: false,
            message: "Error interno al recopilar las estadísticas del dashboard.",
            error: error.message
        });
    }
};