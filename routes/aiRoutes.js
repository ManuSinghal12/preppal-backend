const express = require("express")
const router = express.Router()
const { askNote, generateQuestions, explainConcept,
    getPrepSummary, mockInterview } = require("../controllers/aiController")
const { protect } = require("../middleware/authMiddleware")

router.use(protect)

router.post("/ask", askNote)
router.post("/generate-questions", generateQuestions)
router.post("/explain", explainConcept)
router.get("/prep-summary", getPrepSummary)
router.post("/mock-interview", mockInterview)

module.exports = router