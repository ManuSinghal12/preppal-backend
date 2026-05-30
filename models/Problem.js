const mongoose = require("mongoose")
const problemSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: { type: String, required: [true, "Title is required"], trim: true },
    platform: { type: String, enum: ["LeetCode", "GFG", "HackerRank", "CodeForces", "Other"], default: "Leetcode" },
    topic: {
        type: String,
        required: [true, "Topic is required"],
        enum: ["Arrays", "Strings", "Linked List", "Stack-Queue", "Trees", "Graphs",
            "DP", "Recursion", "Sorting", "Binary Search", "Greedy", "Heap", "Other"]
    },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
    status: { type: String, enum: ["Solved", "Stuck", "Revise", "To Do"], default: "To Do" },
    notes: { type: String, default: "" },
    dateSolved: { type: Date },
    tags: { type: [String], default: [] }
}, { timestamps: true })

const Problem = mongoose.model("Problem", problemSchema)
module.exports = Problem