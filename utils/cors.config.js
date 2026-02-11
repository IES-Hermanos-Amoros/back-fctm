require("dotenv").config()


const DEFAULT_CORS_WHITELIST = [
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3015",
  "http://127.0.0.1:3015"
];

let whiteList;

try {
  whiteList = process.env.CORS_WHITE_LIST
    ? JSON.parse(process.env.CORS_WHITE_LIST)
    : DEFAULT_CORS_WHITELIST;
} catch (err) {
  console.warn("⚠️ CORS_WHITE_LIST en .env no es JSON válido. Usando valores por defecto.");
  whiteList = DEFAULT_CORS_WHITELIST;
}

console.log("✅ CORS WHITELIST:", whiteList);

/**
 * Función reutilizable para validar origin (vale para Express y Socket.IO)
 */
const checkOrigin = (origin, callback) => {
  console.log("CORS ORIGIN:", origin);

  if (!origin || whiteList.includes(origin)) {
    callback(null, true);
  } else {
    callback(new Error("No pasarás! (CORS)"));
  }
};

module.exports = {
  whiteList,
  checkOrigin
};