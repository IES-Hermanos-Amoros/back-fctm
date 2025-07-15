require("dotenv").config()
const morgan = require("morgan")
const fs = require("fs")
const express = require("express")
const app = express()
const ruta = process.env.LOGS_FOLDER
const loggerActivo = process.env.LOGGER_ACTIVO


exports.usingMorgan = () => {
    return morgan("combined", {    
      stream: (app.get("env") == "development" &&  loggerActivo == 1)? fs.createWriteStream(ruta + "access.log", {flags:"a"}):'' //append (insertar al final del archivo)  
    })
}