const fs = require("fs");
const http = require("http");
const https = require("https");
const crypto = require("crypto");

const serverState = { type: "http" };

/**
 * Levanta un servidor HTTP
 * @param {Express.Application} app 
 * @param {number} port 
 * @returns {http.Server}
 */
function startHTTP(app, port) {
  const server = http.createServer(app);
  return server;
}

/**
 * Comprueba si un certificado X.509 ha expirado
 * @param {string} certPath Ruta al certificado .crt
 * @returns {boolean} true si válido, false si caducado o inválido
 */
function isCertificateValid(certPath) {
  try {
    const certPEM = fs.readFileSync(certPath, "utf-8");
    const cert = new crypto.X509Certificate(certPEM);

    const now = new Date();
    const validFrom = new Date(cert.validFrom);
    const validTo = new Date(cert.validTo);

    if (now < validFrom || now > validTo) {
      console.warn(`Certificado expirado o aún no válido: ${validFrom} - ${validTo}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Error leyendo certificado: ${err.message}`);
    return false;
  }
}

/**
 * Levanta un servidor HTTPS si el certificado es válido
 * @param {Express.Application} app 
 * @param {number} port 
 * @param {string} keyPath 
 * @param {string} certPath 
 * @returns {https.Server|http.Server}
 */
function startHTTPS(app, port, keyPath, certPath) {
  if (!isCertificateValid(certPath)) {
    console.warn("HTTPS no se puede levantar. Usando HTTP como fallback.");
    return startHTTP(app, port);
  }

  try {
    const key = fs.readFileSync(keyPath);
    const cert = fs.readFileSync(certPath);
    const server = https.createServer({ key, cert }, app);
    serverState.type = "https"
    return server;
  } catch (err) {
    console.error(`Error levantando HTTPS: ${err.message}`);
    console.warn("Usando HTTP como fallback.");
    return startHTTP(app, port);
  }
}

module.exports = { startHTTP, startHTTPS, serverState };