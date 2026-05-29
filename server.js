require("dotenv").config()
const express = require("express")
const cors = require("cors")
const connectDB = require("./config/db")

connectDB()

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
    res.json({ message: "PrepPal server is running" })
})

app.get("/api/test", (req, res) => {
    res.json({ message: "PrepPal server is running" })
})

const PORT = process.env.PORT || 5050

const { errorHandler } = require("./middleware/errorMiddleware")

app.use("/api/auth", require("./routes/authRoutes"))
app.use(errorHandler)

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
