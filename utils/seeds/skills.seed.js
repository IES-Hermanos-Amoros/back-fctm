const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const mongodbConfig = require("../mongodb.config")

// Importación de modelos
const Skill = require("../../models/skillManager.model");
const User = require("../../models/userManager.model"); // Ajusta el nombre según tu archivo

const ejecutar = async () => {
    try {
        // 1. Conexión a la base de datos
        await mongodbConfig.conectarMongoDB();
        console.log("--- Conectado con MongoDB ---");

        // 2. Limpieza de colecciones (Borrado total para evitar duplicados en la seed)
        console.log("Limpiando colección de Skills...");
        await Skill.deleteMany({});
        // Nota: No borramos usuarios para no romper otras partes, pero buscamos al admin
        console.log("Base de datos lista para sembrar.");

        // 3. Obtener o Crear un usuario Admin para asignar las skills
        let adminUser = await User.findOne({ SAO_username: "admin" });
        
        if (!adminUser) {
            console.log("Admin no encontrado, creando uno temporal para la seed...");
            /*adminUser = await User.create({
                username: "admin_seed",
                password: await bcrypt.hash("Admin123@", 12),
                profile: "ADMINISTRADOR"
            });*/
            throw new Error("Admin no encontrado con ese username")
        }

        // 4. Listado extenso de aptitudes (LinkedIn Style)
        const aptitudesData = [
            // Soft Skills
            "LIDERAZGO", "TRABAJO EN EQUIPO", "COMUNICACIÓN EFECTIVA", "RESOLUCIÓN DE PROBLEMAS",
            "GESTIÓN DEL TIEMPO", "PENSAMIENTO CRÍTICO", "ADAPTABILIDAD", "NEGOCIACIÓN",
            "INTELIGENCIA EMOCIONAL", "CREATIVIDAD", "HABLAR EN PÚBLICO", "EMPATÍA",
            
            // Tecnología / IT
            "DESARROLLO WEB", "JAVASCRIPT", "PYTHON", "JAVA", "HTML5", "CSS3", "REACT",
            "NODE.JS", "SQL", "NOSQL", "CLOUD COMPUTING", "CIBERSEGURIDAD", "GIT",
            "DOCKER", "KUBERNETES", "INTELIGENCIA ARTIFICIAL", "MACHINE LEARNING",
            "SOPORTE TÉCNICO", "ADMINISTRACIÓN DE SISTEMAS", "REDES DE COMPUTADORES",
            "TYPESCRIPT", "ANGULAR", "VUE.JS", "AWS", "AZURE", "PHP", "C#", "C++",

            // Gestión y Marketing
            "GESTIÓN DE PROYECTOS", "ESTRATEGIA DE NEGOCIO", "DESARROLLO DE NEGOCIO",
            "PLANIFICACIÓN ESTRATÉGICA", "ANÁLISIS DE DATOS", "RECURSOS HUMANOS",
            "VENTAS", "ATENCIÓN AL CLIENTE", "MARKETING DIGITAL", "SEO", "SEM",
            "CONTENT MARKETING", "GOOGLE ANALYTICS", "E-COMMERCE",

            // Diseño y Social
            "DISEÑO GRÁFICO", "UI/UX", "FIGMA", "ADOBE PHOTOSHOP", "ADOBE ILLUSTRATOR",
            "EDICIÓN DE VÍDEO", "DOCENCIA", "E-LEARNING", "INTERVENCIÓN SOCIAL",
            "INTEGRACIÓN SOCIAL", "PSICOLOGÍA", "ORIENTACIÓN LABORAL",

            // Agro y Medio Ambiente
            "AGRICULTURA ECOLÓGICA", "PAISAJISMO", "GESTIÓN AMBIENTAL", "BOTÁNICA",
            "CONTROL DE PLAGAS", "SOSTENIBILIDAD", "GESTIÓN FORESTAL", "JARDINERÍA"
        ];

        // 5. Preparación de objetos para inserción
        console.log(`Preparando ${aptitudesData.length} aptitudes...`);
        
        const skillsParaInsertar = aptitudesData.map(nombre => ({
            FCTM_skill_name: nombre,
            FCTM_skill_verified: true, // Las de la seed son oficiales
            FCTM_skill_usage_count: Math.floor(Math.random() * 50), // Simulamos algo de popularidad
            FCTM_skill_created_by: adminUser._id
        }));

        // 6. Inserción masiva
        await Skill.insertMany(skillsParaInsertar);
        console.log(`${skillsParaInsertar.length} Aptitudes insertadas correctamente.`);

        console.log("\n--- SEED DE SKILLS FINALIZADA CON ÉXITO ---");

    } catch (error) {
        console.error("Error durante la ejecución de la seed de skills:", error);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
};

ejecutar();