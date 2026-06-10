require("dotenv").config()
const express = require("express")
const cors = require("cors")
const path = require("path")
const connectDB = require("./config/db")

connectDB()

const app = express()

const corsOptions = {
    origin: [
        "http://localhost:5173",
        process.env.FRONTEND_URL
    ],
    credentials: true
}
app.use(cors(corsOptions))
app.use(express.json())
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith(".pdf")) res.setHeader("Content-Disposition", "inline")
    }
}))

app.get("/", (req, res) => {
    res.json({ message: "PrepPal server is running" })
})

app.get("/api/test", (req, res) => {
    res.json({
        message: "PrepPal server is running",
        notesUploadRoute: "POST /api/notes/upload"
    })
})

const PORT = process.env.PORT || 5050

const { errorHandler } = require("./middleware/errorMiddleware")

app.use("/api/auth", require("./routes/authRoutes"))
app.use("/api/problems", require("./routes/problemRoutes"))
app.use("/api/notes", require("./routes/noteRoutes"))
app.use("/api/ai", require("./routes/aiRoutes"))
app.use("/api/saved-answers", require("./routes/savedAnswerRoutes"))
app.use(errorHandler)

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
