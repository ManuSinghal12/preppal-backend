const Problem = require("../models/Problem")

//GET /api/problems - supports ?topic=&difficulty=&status=&platform=&search=
const getAll = async (req, res, next) => {
    try {
        const { topic, difficulty, status, platform, search } = req.query
        const query = { userId: req.user._id }     // always scope to logged-in user
        if (topic) query.topic = topic
        if (difficulty) query.difficulty = difficulty
        if (status) query.status = status
        if (platform) query.platform = platform
        if (search) query.title = { $regex: search, $options: "i" }
        const problems = await Problem.find(query).sort({ createdAt: -1 })
        res.json(problems)
    } catch (error) { next(error) }
}

//POST /api/problems
const create = async (req, res, next) => {
    try {
        const { title, platform, topic, difficulty, status, notes, dateSolved, tags } = req.body
        if (!title || !topic) {
            res.status(400)
            throw new Error("Title and topic are required")
        }
        const problem = await Problem.create({
            userId: req.user._id,
            title, platform, topic, difficulty, status, notes, dateSolved, tags
        })
        res.status(201).json(problem)
    } catch (error) { next(error) }
}

// PUT /api/problems/:id
const update = async (req, res, next) => {
    try {
        const problem = await Problem.findById(req.params.id)
        if (!problem) { res.status(404); throw new Error("Problem not found") }
        // ownership check — compare as strings because MongoDB ObjectId !== plain string
        if (problem.userId.toString() !== req.user._id.toString()) {
            res.status(403); throw new Error("Not authorised to edit this problem")
        }
        const updated = await Problem.findByIdAndUpdate(
            req.params.id, req.body, { new: true, runValidators: true }
        )
        res.json(updated)
    } catch (error) { next(error) }
}

// DELETE /api/problems/:id
const remove = async (req, res, next) => {
    try {
        const problem = await Problem.findById(req.params.id)
        if (!problem) { res.status(404); throw new Error("Problem not found") }
        if (problem.userId.toString() !== req.user._id.toString()) {
            res.status(403); throw new Error("Not authorised to delete this problem")
        }
        await Problem.findByIdAndDelete(req.params.id)
        res.json({ message: "Problem deleted" })
    } catch (error) { next(error) }
}

module.exports = { getAll, create, update, remove }

