const crypto = require("crypto");

// 🔐 ALGORITMO SEGURO
const ALGORITHM = "aes-256-gcm";

// 🔑 CLAVE SEED (puedes cambiarla, pero NO después de cifrar datos)
const DATA_SECRET = "FCT_MANAGER_2025_SUPER_SECRET_KEY_CHANGE_ME";

// ⚠️ NO TOCAR
// Convertimos la seed en una clave REAL de 32 bytes
const KEY = crypto
  .createHash("sha256")
  .update(DATA_SECRET)
  .digest(); // ← Buffer de 32 bytes exactos

// 🔒 CIFRAR
function encrypt(text) {
  if (!text || typeof text !== "string") return text;
  if (text.startsWith("enc:")) return text; // evita doble cifrado

  const iv = crypto.randomBytes(12); // 96 bits recomendado para GCM
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  // Formato: enc:iv:authTag:data
  return `enc:${iv.toString("hex")}:${authTag}:${encrypted}`;
}

// 🔓 DESCIFRAR
function decrypt(text) {
  if (!text || typeof text !== "string") return text;
  if (!text.startsWith("enc:")) return text;

  const [, ivHex, tagHex, encrypted] = text.split(":");

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    KEY,
    Buffer.from(ivHex, "hex")
  );

  decipher.setAuthTag(Buffer.from(tagHex, "hex"));

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

module.exports = {
  encrypt,
  decrypt
};