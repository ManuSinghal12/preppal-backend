const express = require("express")
const router = express.Router()
const { askNote, generateQuestions } = require("../controllers/aiController")
const { protect } = require("../middleware/authMiddleware")

router.use(protect)

router.post("/ask", askNote)
router.post("/generate-questions", generateQuestions)

module.exports = router