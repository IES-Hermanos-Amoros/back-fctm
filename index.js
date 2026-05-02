//require("dotenv").config();
const dotenv = require('dotenv')
//const session = require("express-session");
const methodOverride = require("method-override");
const express = require("express");
const app = express();
const path = require("path");
// Captura el entorno (por defecto 'development')
const env = process.env.NODE_ENV || 'development';
const envPath = path.resolve(process.cwd(), `.env.${env}`);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error(`❌ No se pudo encontrar el archivo: .env.${env}`);
  // Opcional: cargar el .env normal si falla el específico
  dotenv.config(); 
}
console.log(`🚀 ENTORNO CARGADO: ${env}`);
//console.log(`📦 MONGO DB ATLAS URL: ${process.env.MONGODB_ATLAS}`);


const port = process.env.PORT || process.env.PUERTO;

const socketIo = require("socket.io");
const { startHTTP, startHTTPS, serverState } = require("./serverLauncher");
const usingHTTPS = process.env.USE_HTTPS || 0;
const keySSL = process.env.HTTPS_KEY_SSL || "certs/localhost-2daw-2526.key";
const crtSSL = process.env.HTTPS_CRT_SSL || "certs/localhost-2daw-2526.crt";

const mongodbConfig = require("./utils/mongodb.config");
const saoRoutes = require("./routes/sao.routes");
const jobOfferRoutes = require("./routes/joboffer.routes");
const documentRoutes = require("./routes/document.routes");
const adminRoutes = require("./routes/admin.routes");
const teacherRoutes = require("./routes/teacher.routes");
const studentRoutes = require("./routes/student.routes");
const companyRoutes = require("./routes/company.routes");
const reviewRoutes = require("./routes/review.routes");
const fctRoutes = require("./routes/fct.routes");
const actionRoutes = require("./routes/action.routes")
const dummyRoutes = require("./routes/dummy.routes");
const skillRoutes = require("./routes/skill.routes");
const categoryRoutes = require("./routes/category.routes");
const enumRoutes = require("./routes/enum.routes")
//LOGINSAOFCTM INI
const authRoutes = require("./routes/auth.routes");
//LOGINSAOFCTM FIN

const morganMW = require("./middlewares/morgan.mw");
const logger = require("./utils/logger");
const errorHandlerMW = require("./middlewares/errorHandler.mw");
const AppError = require("./utils/AppError");
const cors = require("cors");
const { checkOrigin, whiteList } = require("./utils/cors.config");

const cookieParser = require('cookie-parser');

// =================== CONFIG EXPRESS ===================
const server =
  usingHTTPS == 1
    ? startHTTPS(app, port, keySSL, crtSSL)
    : startHTTP(app, port);

// Inicializar Socket.IO sobre el mismo server
const io = socketIo(server, {
  cors: { 
      origin: whiteList, 
      methods: ['GET', 'POST'],
      credentials: true 
    }
});


app.use(methodOverride("_method"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(`/api/${process.env.API_VERSION}/uploads`, express.static(path.join(__dirname, "uploads")));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cookieParser());
app.use(cors({ origin: checkOrigin, credentials: true }));
app.use(morganMW.usingMorgan());
/*app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 3600000, sameSite: "none", httpOnly: false },
  })
);*/

// =================== RUTAS GENERALES ===================
app.use(`/api/${process.env.API_VERSION}/sao`, saoRoutes(io));
app.use(`/api/${process.env.API_VERSION}/joboffers`, jobOfferRoutes);
app.use(`/api/${process.env.API_VERSION}/documents`, documentRoutes);
app.use(`/api/${process.env.API_VERSION}/administrators`, adminRoutes);
app.use(`/api/${process.env.API_VERSION}/teachers`, teacherRoutes);
app.use(`/api/${process.env.API_VERSION}/students`, studentRoutes);
app.use(`/api/${process.env.API_VERSION}/companies`, companyRoutes);
app.use(`/api/${process.env.API_VERSION}/reviews`, reviewRoutes);
app.use(`/api/${process.env.API_VERSION}/fct`, fctRoutes);
app.use(`/api/${process.env.API_VERSION}/actions`, actionRoutes);
app.use(`/api/${process.env.API_VERSION}/dummy`, dummyRoutes);
app.use(`/api/${process.env.API_VERSION}/skills`, skillRoutes);
app.use(`/api/${process.env.API_VERSION}/categories`, categoryRoutes);

//LOGINSAOFCTM INI
app.use(`/api/${process.env.API_VERSION}/auth`,authRoutes)
//LOGINSAOFCTM FIN
app.use(`/api/${process.env.API_VERSION}/enums`,enumRoutes)


// =================== CATCH-ALL 404 ===================
// Solo al final, después de todas las rutas
app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/socket.io")) return next();
  logger.error.fatal("Ruta no existente " + req.originalUrl);
  throw new AppError("Ruta no existente", 404);
});

// Middleware de error final
app.use(errorHandlerMW.errorHandler);


// Arrancar el servidor
server.listen(port, async() => {
      console.log(`✅ Servidor ${serverState.type} levantado en ${serverState.type}://localhost:${port}/api/${process.env.API_VERSION}/dummy`);
      try {
        // Conexión a MongoDB
          await mongodbConfig.conectarMongoDB();
          console.log("✅ Conectado con MongoDB Atlas!!!");
          if (io.engine) {
            console.log('✅ El servidor Socket.IO está iniciado.');
          } else {
            console.log('❌ El servidor Socket.IO no parece estar inicializado.');
          }
      } catch (error) {
          console.error("❌ Error al iniciar el servidor o BD:", error);
          process.exit(1);
      }
})