const multer = require("multer")
const fs = require("fs")
const path = require("path")

const uploadDir = path.join(__dirname, "..", "uploads")
fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uid = Date.now() + "-" + Math.round(Math.random() * 1e9)
        cb(null, uid + path.extname(file.originalname))
    }
})

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if ([".pdf", ".txt"].includes(ext)) cb(null, true)
    else cb(new Error("Only .pdf and .txt files are allowed"), false)
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
})

module.exports = upload
