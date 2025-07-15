require("dotenv").config()
const mongoose = require("mongoose")

exports.conectarMongoDB = async() => {
    return mongoose.connect(process.env.MONGODB_ATLAS)
}