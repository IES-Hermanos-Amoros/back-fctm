require("dotenv").config()
const mongoose = require("mongoose")

/*exports.conectarMongoDB = async() => {
    return mongoose.connect(process.env.MONGODB_ATLAS)
}*/

/*exports.conectarMongoDB = async() => {
    while(true) {
        try {
            return mongoose.connect(process.env.MONGODB_URI,{
                family: 4,
                serverSelectionTimeoutMS: 5000
            })   
        } catch (error) {
            console.error("Error al conectar a MongoDB Atlas:", error)
            console.log("Reintentando en 5 segundos...")
            await new Promise(resolve => setTimeout(resolve, 5000))
        }   
}}*/

exports.conectarMongoDB = async () => {
    while (true) {
        try {
            await mongoose.connect(process.env.MONGODB_URI, {
                family: 4,
                serverSelectionTimeoutMS: 5000
            });
            console.log("✅ MongoDB conectada");
            return;
        } catch (error) {
            console.error("❌ Error al conectar a MongoDB Atlas:", error.message);
            console.log("🔄 Reintentando en 5 segundos...");
            await new Promise(resolve =>
                setTimeout(resolve, 5000)
            );
        }
    }
};

mongoose.connection.on('connected', () => {
    console.log('🟢 Mongoose conectado');
});

mongoose.connection.on('error', (err) => {
    console.log('🔴 Error de mongoose:', err.message);
});

mongoose.connection.on('disconnected', () => {
    console.log('🟠 Mongoose desconectado');
});