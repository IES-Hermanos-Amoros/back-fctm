const express = require("express");
const app = express()
require("dotenv").config()
//winston (otra librería para logs de express)
const log4js = require("log4js") //npm i log4js
const ruta = process.env.LOGS_FOLDER
const loggerActivo = process.env.LOGGER_ACTIVO

if(app.get("env") == "development" && loggerActivo == 1){
    log4js.configure({
        appenders: {
            access: {
                type:"dateFile",
                filename: ruta + "access.log",
                pattern:"-yyyy-MM-dd"
            },
            error: {
                type:"dateFile",
                filename: ruta + "error.log",
                pattern:"-yyyy-MM-dd"
            }
        },
        categories:{
            default: { appenders: ["access"], level: "ALL"},
            access: { appenders: ["access"], level:"ALL"},
            error: { appenders: ["error"], level:"ALL"}
        }
    })
} else {
    //NO Estoy en DESARROLLO (estoy en PRODUCCIÓN, por ejemplo) O el LOGGER NO ESTÁ ACTIVO
    log4js.configure({
       appenders: {
            out: { type: 'console' }
        },
            categories: {
            default: { appenders: ['out'], level: 'info' }
        }
    })
}

const acceso = log4js.getLogger("access")
const err = log4js.getLogger("error")

module.exports = {
    access: acceso,
    error: err,
    express: log4js.connectLogger(acceso)
}