const multer = require("multer")
const path = require("path")
const fs = require("fs")

// Ruta de almacenamiento
const uploadPath = path.join(__dirname, "../uploads")

//Configurar multer
const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null, uploadPath)
    },
    filename:(req,file,cb) => {
        const timeStamp = Date.now()
        const random = Math.round(Math.random() * 1e9)
        const ext = path.extname(file.originalname)
        const baseName = path
            .basename(file.originalname, ext)
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9\-]/g,"")
        
        const fileName = `${timeStamp}-${random}-${baseName}-${ext}`

        cb(null, fileName)
    }
})


const upload = multer({storage})


module.exports = upload