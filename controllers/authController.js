const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" })

}
const signup = async (req, res, next) => {
    try {
        const { name, email, password, role, branch, targetCompanies, goals } = req.body
        if (!name || !email || !password) {
            res.status(400)
            throw new Error("Please fill all required fields")

        }
        const userExists = await User.findOne({ email })
        if (userExists) {
            res.status(400)
            throw new Error("Email already registered")
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            branch,
            targetCompanies,
            goals
        })
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            branch: user.branch,
            targetCompanies: user.targetCompanies,
            goals: user.goals,
            token: generateToken(user._id)
        })

    } catch (error) {
        next(error)
    }
}
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user || !(await bcrypt.compare(password, user.password))) {
            res.status(401)
            throw new Error("Invalid email or password")

        }
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            branch: user.branch,
            targetCompanies: user.targetCompanies,
            goals: user.goals,
            token: generateToken(user._id)
        })

    } catch (error) { next(error) }
}

const getProfile = async (req, res) => {
    res.json(req.user)
}

const updateProfile = async (req, res, next) => {
    try {
        const { name, branch, targetCompanies, goals, role } = req.body
        const updated = await User.findByIdAndUpdate(
            req.user._id,
            { name, branch, targetCompanies, goals, role },
            { returnDocument: 'after', runValidators: true }
        ).select("-password")
        res.json(updated)
    } catch (error) { next(error) }
}

module.exports = { signup, login, getProfile, updateProfile }
