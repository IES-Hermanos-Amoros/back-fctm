const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { fileTypeFromFile } = require("file-type");
const {CLAMSCAN_ACTIVE, clamscan} = require("../utils/clam-scan");

// Ruta de almacenamiento
const uploadPath = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
}

// Tipos permitidos
const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

// Configurar multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => {
        const timeStamp = Date.now();
        const random = Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        const baseName = path
            .basename(file.originalname, ext)
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9\-]/g, "");
        const fileName = `${timeStamp}-${random}-${baseName}${ext}`;
        cb(null, fileName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

const validateAndScanFiles = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) return next();

        for (const file of req.files) {
            const filePath = file.path;

            const type = await fileTypeFromFile(filePath);
            if (!type || !ALLOWED_MIME_TYPES.includes(type.mime)) {
                fs.unlinkSync(filePath);
                return res.status(400).json({
                    error: `Archivo no permitido o potencialmente malicioso: ${file.originalname}`
                });
            }

            if (CLAMSCAN_ACTIVE) {
                const { isInfected, viruses } = await clamscan.then(c => c.scanFile(filePath));
                if (isInfected) {
                    fs.unlinkSync(filePath);
                    return res.status(400).json({
                        error: `Archivo infectado detectado: ${file.originalname}`,
                        viruses
                    });
                }
            }
        }

        next();
    } catch (error) {
        console.error("Error en validación o escaneo:", error);
        return res.status(500).json({
            error: "Error validando o escaneando archivos"
        });
    }
};

module.exports = {
    upload,
    validateAndScanFiles
};