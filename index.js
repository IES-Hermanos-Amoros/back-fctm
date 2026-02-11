require("dotenv").config();
const session = require("express-session");
const methodOverride = require("method-override");
const express = require("express");
const app = express();
const path = require("path");
const port = process.env.PORT || process.env.PUERTO;

const socketIo = require("socket.io");
const { startHTTP, startHTTPS, serverType } = require("./serverLauncher");
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
const dummyRoutes = require("./routes/dummy.routes");

const morganMW = require("./middlewares/morgan.mw");
const logger = require("./utils/logger");
const errorHandlerMW = require("./middlewares/errorHandler.mw");
const AppError = require("./utils/AppError");
const cors = require("cors");
const { checkOrigin, whiteList } = require("./utils/cors.config");

//let io; // Socket.IO

// =================== CONFIG EXPRESS ===================
const server =
  usingHTTPS == 1
    ? startHTTPS(app, port, keySSL, crtSSL)
    : startHTTP(app, port);

// Inicializar Socket.IO sobre el mismo server
//const socketIo = require("socket.io");
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
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cors({ origin: checkOrigin, credentials: true }));
app.use(morganMW.usingMorgan());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 3600000, sameSite: "none", httpOnly: false },
  })
);

// =================== RUTAS GENERALES ===================
app.use(`/api/${process.env.API_VERSION}/sao`, saoRoutes(io));
app.use(`/api/${process.env.API_VERSION}/joboffers`, jobOfferRoutes);
app.use(`/api/${process.env.API_VERSION}/documents`, documentRoutes);
app.use(`/api/${process.env.API_VERSION}/administrators`, adminRoutes);
app.use(`/api/${process.env.API_VERSION}/teachers`, teacherRoutes);
app.use(`/api/${process.env.API_VERSION}/students`, studentRoutes);
app.use(`/api/${process.env.API_VERSION}/companies`, companyRoutes);
app.use(`/api/${process.env.API_VERSION}/dummy`, dummyRoutes);

// =================== ARRANQUE DEL SERVIDOR ===================
const startServerOLD = async () => {
  try {
    // Levantar HTTP/HTTPS
    const server =
      usingHTTPS == 1
        ? startHTTPS(app, port, keySSL, crtSSL)
        : startHTTP(app, port);

   

    // Inicializar Socket.IO sobre el mismo server
    //const socketIo = require("socket.io");
    io = socketIo(server, {
      cors: { 
          origin: whiteList, 
          methods: ['GET', 'POST'],
          credentials: true 
        }
    });

    /*io.on("connection", (socket) => {
      console.log("🟢 Cliente conectado:", socket.id);
      socket.on("disconnect", () => console.log("🔴 Cliente desconectado:", socket.id));
    });*/

    // Registrar rutas que dependen de io **ya con io inicializado**
    //app.use(`/api/${process.env.API_VERSION}/sao`, saoRoutes(io));

   //Arrancar server
    server.listen(port, () => {
      console.log(`Servidor ${serverType} levantado en ${serverType}://localhost:${port}`);
    });

    // Conexión a MongoDB
    await mongodbConfig.conectarMongoDB();
    console.log("Conectado con MongoDB Atlas!!!");
  } catch (error) {
    console.error("Error al iniciar el servidor o BD:", error);
    process.exit(1);
  }
};



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
//startServer();

server.listen(port, async() => {
      console.log(`Servidor ${serverType} levantado en ${serverType}://localhost:${port}`);
      try {
        // Conexión a MongoDB
          await mongodbConfig.conectarMongoDB();
          console.log("Conectado con MongoDB Atlas!!!");
      } catch (error) {
          console.error("Error al iniciar el servidor o BD:", error);
          process.exit(1);
      }

})