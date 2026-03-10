const mongoose = require("mongoose");
const mongodbConfig = require("../mongodb.config"); // Ajusta la ruta a tu config de conexión
const Category = require("../../models/categoryManager.model"); // Ajusta la ruta a tu modelo
const { CATEGORY_NAME } = require("../../models/enum"); // Ajusta la ruta a tus enums

const sembrarCategorias = async () => {
    try {
        // 1. Conexión a la base de datos
        await mongodbConfig.conectarMongoDB();
        console.log("--- Conectado con MongoDB para Seed de Categorías ---");

        // 2. Limpieza de la colección
        // Importante porque FCTM_category_name es 'unique'
        console.log("Limpiando colección de Categorías...");
        await Category.deleteMany({});
        console.log("Colección limpia.");

        // 3. Preparación de los datos basados en el ENUM
        console.log(`Preparando ${CATEGORY_NAME.length} categorías oficiales...`);
        
        const categoriasParaInsertar = CATEGORY_NAME.map(nombre => ({
            FCTM_category_name: nombre
        }));

        // 4. Inserción masiva y captura de resultados
        // Guardamos el resultado para obtener los objetos con sus IDs generados
        const categoriasInsertadas = await Category.insertMany(categoriasParaInsertar);
        
        console.log("\n--- SEED DE CATEGORÍAS FINALIZADA ---");
        console.log("Copia estos objetos si los necesitas para otros seeds:\n");

        // 5. Output en formato JSON exacto
        categoriasInsertadas.forEach((cat, index) => {
            const esUltimo = index === categoriasInsertadas.length - 1;
            const item = {
                _id: cat._id.toString(),
                FCTM_category_name: cat.FCTM_category_name
            };
            
            // Imprimimos con formato de objeto y una coma al final (si no es el último)
            console.log(JSON.stringify(item, null, 2) + (esUltimo ? "" : ","));
        });

    } catch (error) {
        console.error("Error durante la ejecución de la seed de categorías:", error);
    } finally {
        // 5. Cerrar conexión y salir
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            console.log("Conexión a MongoDB cerrada.");
        }
        process.exit(0);
    }
};

sembrarCategorias();