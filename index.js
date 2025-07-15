//IMPORTS/REQUIRE
//PROCESS.ENV (npm i dotenv)
require("dotenv").config()
const session = require("express-session") //npm i express-session
const methodOverride = require("method-override") //npm i method-override
const express = require("express") //npm i express
const app = express()
const path = require("path") //npm i path
const port = process.env.PORT || process.env.PUERTO

const mongodbConfig = require("./utils/mongodb.config")
const saoRoutes = require("./routes/sao.routes")


const morganMW = require("./middlewares/morgan.mw")
const logger = require("./utils/logger")
const errorHandlerMW = require("./middlewares/errorHandler.mw")
const AppError = require("./utils/AppError")
const cors = require("cors")
//INI WebSocket
const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:5173', // URL del frontend
        methods: ['GET', 'POST'],
        credentials: true, // Si usas cookies o autenticación basada en sesiones
      }
});
//FIN WebSocket



//CONFIGURACIONES
app.use(methodOverride("_method"))
app.set("views",path.join(__dirname,"views"))
app.set("view engine","ejs") //npm i ejs
app.use(express.static(path.join(__dirname,"public")))

//app.use(express.urlencoded({extended:true})) //Para poder leer datos (request body) en métodos POST
//app.use(express.json()) //Leer datos JSON en request body POST
// Aumentar el tamaño máximo permitido en el cuerpo de la solicitud
app.use(express.json({ limit: '10mb' }));  // Esto aumenta el límite a 10 MB
app.use(express.urlencoded({ limit: '10mb', extended: true }));  // Para formularios con archivos (si es necesario)



const whiteList = ["http://localhost:5500","http://127.0.0.1:5500","http://localhost:5173","http://127.0.0.1:5173","http://localhost:3015","http://127.0.0.1:3015"]
const corsOptions = {
    origin:(origin, callback) => {
        console.log(origin)
        //Permitimos conexiones externas (desde FrontEnd) y
        //conexiones internas desde nuestro propio API (origin = undefined)
        if(whiteList.includes(origin) || !origin){
            callback(null,true)
        }else{
            callback(new AppError("No pasarás!",403))
        }
    },
    credentials:true //Enviar la cookie SID
}
//app.use(cors()) //CORS ABIERTO AL MUNDO
app.use(cors(corsOptions))



app.use(morganMW.usingMorgan())

app.use(session({
    //name:"manolico",//"connect.sid", //default
    secret:process.env.SESSION_SECRET,//Firmar el SID, para generar el código y que no sea manipulado
    resave:false,//No se guardará en el store si no ha cambiado
    saveUninitialized:false,//No se guardará en el store hasta que no se inicialice de alguna forma
    cookie:{
        secure:false,//la sesión se enviará sólo en HTTPS (si está a true)
        maxAge:3600000, //1hora (tiempo expiración cookie SID)        
        //TEMPORAL PARA EJS
        sameSite:"none", //Permite envío de cookies en solicitudes entre diferentes dominios (CORS habilitado), pero requiere secure:true
        httpOnly:false
    }    
}))


//RUTAS

app.use(`/api/${process.env.API_VERSION}/sao`,saoRoutes(io))


//Middleware propio para las rutas no existentes
app.use((req,res)=>{
    logger.error.fatal("Ruta no existente " + req.originalUrl)
    throw new AppError("Ruta no existente", 404) //NOT FOUND
})

//Gestión de todos los errores (Síncronos y Asíncronos del API)
app.use(errorHandlerMW.errorHandler)

//HTTP
server.listen(port, async()=>{
    console.log(`${process.env.MENSAJE} http://localhost:${port}/api/${process.env.API_VERSION}/sao`)
    logger.access.info(`${process.env.MENSAJE} http://localhost:${port}/api/${process.env.API_VERSION}/sao`)
    try {
        //Una vez levantado el servidor, intentamos conectar con MongoDB
        await mongodbConfig.conectarMongoDB()
        .then(()=>{
            console.log("Conectado con MongoDB Atlas!!!")
        })
        .catch((err)=>{
            //Si no conectamos con MongoDB, debemos tumbar el server
            console.log(`Error al conectar. Desc: ${err}`)
            process.exit(0)
        })
    } catch (error) {
        //Si no conectamos con MongoDB, debemos tumbar el server
        console.log(`Error en el server. Desc: ${error}`)
        process.exit(0)
    }
})