const mongoose = require("mongoose");
const {hashPassword} = require("../bcrypt")
const mongodbConfig = require("../mongodb.config"); // Ajusta la ruta
const UserManager = require("../../models/userManager.model"); // Ajusta la ruta
const Category = require("../../models/categoryManager.model"); // Para referenciar en empresas
const { USER_PROFILES } = require("../../models/enum"); // Ajusta la ruta

const seedUsuarios = async () => {
    try {
        // 1. Conexión
        await mongodbConfig.conectarMongoDB();
        console.log("--- Conectado para Seed de Usuarios ---");

       // 2. Definición de los IDs específicos para poder borrarlos y luego crearlos
        const idsASembrar = ["ADMIN_001", "PROF_001", "ALUM_001", "EMP_001"];

        // 3. Limpieza SELECTIVA
        console.log(`Limpiando registros previos con IDs: ${idsASembrar.join(", ")}...`);
        await UserManager.deleteMany({ SAO_id: { $in: idsASembrar } });
        console.log("Registros específicos eliminados.");

        // 3. Preparación de seguridad
        const defaultPassword = "IESha123@";
        const hashedPassword = await hashPassword(defaultPassword);

        // 4. Obtener una categoría (opcional, para el perfil de Empresa)
        const unaCategoria = await Category.findOne();
        const categoriaId = unaCategoria ? [unaCategoria._id] : [];

        // 5. Definición de los perfiles
        const usuariosParaInsertar = [
            {
                SAO_id: "ADMIN_001",
                SAO_profile: "ADMINISTRADOR",
                SAO_username: "admin",
                SAO_name: "Admin Sistema",
                SAO_email: "admin@centro.com",
                FCTM_contact_email: "admin@centro.com",
                FCTM_password: hashedPassword,
                FCTM_firstLogin: false,
                FCTM_email_verified: true
            },
            {
                SAO_id: "PROF_001",
                SAO_profile: "PROFESOR",
                SAO_username: "profe",
                SAO_name: "Juan Pérez",
                SAO_organization: "Departamento Informática",
                SAO_email: "juan.perez@centro.com",
                FCTM_contact_email: "juan.perez@centro.com",
                FCTM_password: hashedPassword,
                FCTM_teacher_observations: "Tutor de 2º DAW",
                FCTM_email_verified: true,
                FCTM_firstLogin: false
            },
            {
                SAO_id: "ALUM_001",
                SAO_profile: "ALUMNO",
                SAO_username: "alu",
                SAO_name: "Ana García",
                SAO_email: "ana.garcia@alumno.com",
                SAO_student_id: "ID-ANA-99",
                SAO_student_city: "Madrid",
                FCTM_contact_email: "ana.personal@gmail.com",
                FCTM_password: hashedPassword,
                FCTM_firstLogin: false,
                FCTM_student_openToWork: true,
                FCTM_email_verified: true
            },
            {
                SAO_id: "EMP_001",
                SAO_profile: "EMPRESA",
                SAO_username: "empresa",
                SAO_name: "Tech Solutions S.L.",
                SAO_company_activity: "Desarrollo de Software",
                SAO_company_city: "Barcelona",
                FCTM_contact_email: "rrhh@techsolutions.com",
                FCTM_password: hashedPassword,
                FCTM_company_category: categoriaId,
                FCTM_company_openToHire: true,
                FCTM_email_verified: true,
                FCTM_firstLogin: false
            }
        ];

        // 6. Inserción
        const usuariosInsertados = await UserManager.insertMany(usuariosParaInsertar);
        
        console.log(`\n--- SEED FINALIZADA: ${usuariosInsertados.length} usuarios creados ---`);
        console.log(`Password para todos: ${defaultPassword}`);
        
        usuariosInsertados.forEach(u => {
            console.log(`- [${u.SAO_profile}] ID: ${u.SAO_id} | Email: ${u.FCTM_contact_email}`);
        });

    } catch (error) {
        console.error("Error en la seed de usuarios:", error);
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            console.log("Conexión cerrada.");
        }
        process.exit(0);
    }
};

seedUsuarios();


//10099034 - Pons123@ - ivanponsdeonil@hotmail.es (ALUMNO REAL)
//B98064462 - Laberit123@ - personas@laberit.com (EMPRESA REAL)