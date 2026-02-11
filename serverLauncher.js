const fs = require("fs");
const http = require("http");
const https = require("https");
const crypto = require("crypto");

/**
 * Levanta un servidor HTTP y LO DEVUELVE
 */
function startHTTP(app, port) {
  const server = http.createServer(app);

  server.listen(port, () => {
    console.log(`Servidor HTTP levantado en http://localhost:${port}`);
  });

  return server; // ✅ MUY IMPORTANTE
}

/**
 * Comprueba si un certificado X.509 ha expirado
 */
function isCertificateValid(certPath) {
  try {
    const certPEM = fs.readFileSync(certPath, "utf-8");
    const cert = new crypto.X509Certificate(certPEM);

    const now = new Date();
    const validFrom = new Date(cert.validFrom);
    const validTo = new Date(cert.validTo);

    if (now < validFrom || now > validTo) {
      console.warn(
        `Certificado expirado o aún no válido: ${validFrom} - ${validTo}`
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Error leyendo certificado: ${err.message}`);
    return false;
  }
}

/**
 * Levanta HTTPS si el certificado es válido, si no → fallback a HTTP
 */
function startHTTPS(app, port, keyPath, certPath) {
  if (!isCertificateValid(certPath)) {
    console.warn("HTTPS no se puede levantar. Usando HTTP como fallback.");
    return startHTTP(app, port); // ✅ Devuelve el servidor HTTP
  }

  try {
    const key = fs.readFileSync(keyPath);
    const cert = fs.readFileSync(certPath);

    const server = https.createServer({ key, cert }, app);

    server.listen(port, () => {
      console.log(`Servidor HTTPS levantado en https://localhost:${port}`);
    });

    return server; // ✅ MUY IMPORTANTE
  } catch (err) {
    console.error(`Error levantando HTTPS: ${err.message}`);
    console.warn("Usando HTTP como fallback.");
    return startHTTP(app, port); // ✅ Devuelve el servidor HTTP
  }
}

module.exports = { startHTTP, startHTTPS };