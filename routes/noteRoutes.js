const express = require("express")
const router = express.Router()
const { uploadNote, getAllNotes, deleteNote } = require("../controllers/noteController")
const { protect } = require("../middleware/authMiddleware")
const upload = require("../middleware/uploadMiddleware")

router.use(protect)


router.post("/upload", upload.single("file"), uploadNote)
router.get("/", getAllNotes)
router.delete("/:id", deleteNote)

module.exports = router