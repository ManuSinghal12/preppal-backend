const express = require("express")
const router = express.Router()
const { getAll, save, remove } = require("../controllers/savedAnswerController")
const { protect } = require("../middleware/authMiddleware")

router.use(protect)
router.get("/", getAll)
router.post("/", save)
router.delete("/:id", remove)

module.exports = router