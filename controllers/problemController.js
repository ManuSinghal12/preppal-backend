const Problem = require("../models/Problem")
const { getNextRevisionDate } = require("../utils/spacedRevision")

const getRevisionFields = (status, existingProblem = null, solvedDate = null) => {
    if (status !== "Solved") return {}
    if (existingProblem?.nextRevisionDate) return {}

    return {
        nextRevisionDate: getNextRevisionDate(0),
        dateSolved: solvedDate || existingProblem?.dateSolved || new Date()
    }
}

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
            title,
            platform,
            topic,
            difficulty,
            status,
            notes,
            dateSolved,
            tags,
            ...getRevisionFields(status, null, dateSolved)
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
        const updateData = {
            ...req.body,
            ...getRevisionFields(req.body.status, problem, req.body.dateSolved)
        }
        const updated = await Problem.findByIdAndUpdate(
            req.params.id, updateData, { new: true, runValidators: true }
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

// PATCH /api/problems/:id/star
const toggleStar = async (req, res, next) => {
    try {
        const problem = await Problem.findById(req.params.id)
        if (!problem) { res.status(404); throw new Error("Problem not found") }
        if (problem.userId.toString() !== req.user._id.toString()) {
            res.status(403); throw new Error("Not authorised to update this problem")
        }

        problem.isStarred = !problem.isStarred
        const updated = await problem.save()
        res.json(updated)
    } catch (error) { next(error) }
}
// GET /api/problems/revise-today
const getReviseToday = async (req, res, next) => {
    try {
        const today = new Date()
        today.setHours(23, 59, 59, 999)
        const problems = await Problem.find({
            userId: req.user._id,
            nextRevisionDate: { $ne: null, $lte: today }  // not null AND due today or earlier
        })
        res.json(problems)
    } catch (error) { next(error) }
}

// PUT /api/problems/:id/revise
const markRevised = async (req, res, next) => {
    try {
        const problem = await Problem.findById(req.params.id)
        if (!problem) { res.status(404); throw new Error("Problem not found") }
        if (problem.userId.toString() !== req.user._id.toString()) {
            res.status(403); throw new Error("Not authorised to update this problem")
        }
        const nextDate = getNextRevisionDate(problem.revisionCount)
        const updated = await Problem.findByIdAndUpdate(
            req.params.id,
            { $inc: { revisionCount: 1 }, nextRevisionDate: nextDate },
            { new: true }
        )
        res.json(updated)
    } catch (error) { next(error) }
}

module.exports = { getAll, create, update, remove, getReviseToday, markRevised, toggleStar }
