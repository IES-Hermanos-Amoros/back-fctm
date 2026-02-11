require("dotenv").config();
let io = null
const session = require("express-session");
const methodOverride = require("method-override");
const express = require("express");
const app = express();
const path = require("path");
const port = process.env.PORT || process.env.PUERTO;

const { startHTTP, startHTTPS } = require("./serverLauncher");
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
const { insertOne } = require("./models/actionManager.model");

// =================== CONFIG EXPRESS ===================
app.use(methodOverride("_method"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

const corsOptions = { origin: checkOrigin, credentials: true };
app.use(cors(corsOptions));
app.use(morganMW.usingMorgan());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 3600000,
      sameSite: "none",
      httpOnly: false,
    },
  })
);

// =================== RUTAS ===================
app.use(`/api/${process.env.API_VERSION}/sao`, saoRoutes(io));
app.use(`/api/${process.env.API_VERSION}/joboffers`, jobOfferRoutes);
app.use(`/api/${process.env.API_VERSION}/documents`, documentRoutes);
app.use(`/api/${process.env.API_VERSION}/administrators`, adminRoutes);
app.use(`/api/${process.env.API_VERSION}/teachers`, teacherRoutes);
app.use(`/api/${process.env.API_VERSION}/students`, studentRoutes);
app.use(`/api/${process.env.API_VERSION}/companies`, companyRoutes);
app.use(`/api/${process.env.API_VERSION}/dummy`, dummyRoutes);

// Evitar que Socket.IO caiga en 404
app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/socket.io")) return next();
  logger.error.fatal("Ruta no existente " + req.originalUrl);
  throw new AppError("Ruta no existente", 404);
});

app.use(errorHandlerMW.errorHandler);

// =================== ARRANQUE DEL SERVIDOR ===================
const startServer = async () => {
  try {
    // Levanta HTTP o HTTPS y devuelve el server
    const server =
      usingHTTPS == 1
        ? startHTTPS(app, port, keySSL, crtSSL)
        : startHTTP(app, port);

    // Socket.IO sobre el mismo server
    const { Server } = require("socket.io");
    io = new Server(server, {
      cors: {
        origin: whiteList,
        credentials: true,
      },
    });

    io.on("connection", (socket) => {
      console.log("🟢 Cliente conectado al WebSocket:", socket.id);
      socket.on("disconnect", () => {
        console.log("🔴 Cliente desconectado:", socket.id);
      });
    });

    //app.use(`/api/${process.env.API_VERSION}/sao`, saoRoutes(io));


    // Conexión a MongoDB
    await mongodbConfig
      .conectarMongoDB()
      .then(() => console.log("Conectado con MongoDB Atlas!!!"))
      .catch((err) => {
        console.error(`Error al conectar con MongoDB: ${err}`);
        process.exit(0);
      });
  } catch (error) {
    console.error("Error al iniciar el servidor o BD:", error);
    process.exit(1);
  }
};

startServer();