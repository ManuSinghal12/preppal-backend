
const express = require("express")
const router = express.Router()
const { getAll, create, update, remove,
    getReviseToday, markRevised, toggleStar } = require("../controllers/problemController")
const { protect } = require("../middleware/authMiddleware")

router.use(protect)

router.get("/revise-today", getReviseToday)
router.get("/", getAll)
router.post("/", create)
router.put("/:id/revise", markRevised)
router.put("/:id/star", toggleStar)
router.put("/:id", update)
router.delete("/:id", remove)

module.exports = router