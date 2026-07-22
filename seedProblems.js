require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Problem = require("./models/Problem");


const TARGET_EMAIL = "manu.test@gmail.com";

const platforms = ["LeetCode", "LeetCode", "LeetCode", "GFG", "HackerRank", "CodeForces"];
const difficulties = ["Easy", "Medium", "Hard"];
const statuses = ["Solved", "Stuck", "Revise", "To Do"];

const noteTemplates = [
    "Optimized space complexity from O(N) to O(1) using two-pointers.",
    "Need to revisit edge cases involving null nodes and empty arrays.",
    "Solved using standard Memoization; can be converted to Tabulation.",
    "Key trick was using Monotonic Stack to track next greater elements.",
    "Standard BFS traversal. Used a Queue data structure.",
    "Important interview pattern. Mastered sub-problem state transitions.",
    "Handled integer overflow edge case using bit manipulation.",
    "Used Union-Find with path compression for optimal complexity."
];

// 325 Problem Dataset mapped strictly to your schema's 'topic' enum
const topicsMap = {
    "Arrays": [
        "Two Sum", "3Sum", "4Sum", "Container With Most Water", "Trapping Rain Water",
        "Product of Array Except Self", "Rotate Array", "Subarray Sum Equals K", "Next Permutation",
        "Set Matrix Zeroes", "Merge Intervals", "Pascal's Triangle", "Sort Colors", "Majority Element",
        "Find Duplicate Number", "Maximum Subarray", "Game of Life", "Best Time to Buy Stock",
        "Kth Largest Element", "Continuous Subarray Sum", "Longest Consecutive Sequence",
        "Maximum Product Subarray", "Find All Duplicates in Array", "First Missing Positive", "Insert Interval"
    ],
    "Strings": [
        "Valid Anagram", "Group Anagrams", "Longest Palindromic Substring", "Valid Parentheses",
        "Minimum Window Substring", "Longest Substring Without Repeating", "Encode and Decode Strings",
        "Palindromic Substrings", "String to Integer (atoi)", "Zigzag Conversion", "Count and Say",
        "Isomorphic Strings", "Wildcard Matching", "Regular Expression Matching", "Longest Common Prefix",
        "Valid Palindrome", "Reverse String", "Multiply Strings", "Word Pattern", "Restore IP Addresses",
        "Text Justification", "Simplify Path", "Longest Repeating Character Replacement", "Permutation in String",
        "Find All Anagrams in a String"
    ],
    "Linked List": [
        "Reverse Linked List", "Merge Two Sorted Lists", "Reorder List", "Remove Nth Node From End",
        "Linked List Cycle", "Copy List with Random Pointer", "Add Two Numbers", "Merge k Sorted Lists",
        "Intersection of Two Lists", "Palindrome Linked List", "Sort List", "Flatten Multilevel Doubly List",
        "Remove Duplicates from Sorted List", "Rotate List", "Partition List", "Reverse Nodes in k-Group",
        "Swap Nodes in Pairs", "Odd Even Linked List", "Design Linked List", "Delete Node in a Linked List"
    ],
    "Stack-Queue": [
        "Min Stack", "Evaluate Reverse Polish Notation", "Daily Temperatures", "Car Fleet",
        "Largest Rectangle in Histogram", "Implement Queue using Stacks", "Sliding Window Maximum",
        "Decode String", "Basic Calculator", "Asteroid Collision", "Online Stock Span", "Task Scheduler Stack",
        "Trapping Rain Water (Stack)", "Simplify Path (Stack)", "Remove All Adjacent Duplicates",
        "Validate Stack Sequences", "Next Greater Element I", "Next Greater Element II", "132 Pattern", "Maximal Rectangle"
    ],
    "Trees": [
        "Invert Binary Tree", "Maximum Depth of Binary Tree", "Diameter of Binary Tree", "Balanced Binary Tree",
        "Same Tree", "Subtree of Another Tree", "Lowest Common Ancestor", "Binary Tree Level Order Traversal",
        "Validate BST", "Kth Smallest in BST", "Construct Tree from Preorder/Inorder", "Binary Tree Maximum Path Sum",
        "Serialize and Deserialize Binary Tree", "Binary Tree Right Side View", "Count Good Nodes in Binary Tree",
        "Path Sum", "Path Sum II", "Path Sum III", "Binary Tree Zigzag Traversal", "Convert Sorted Array to BST",
        "Construct BST from Preorder", "Flatten Binary Tree to Linked List", "Populating Next Right Pointers",
        "All Nodes Distance K in Binary Tree", "Find Duplicate Subtrees"
    ],
    "Graphs": [
        "Number of Islands", "Max Area of Island", "Clone Graph", "Course Schedule", "Course Schedule II",
        "Pacific Atlantic Water Flow", "Surrounded Regions", "Rotting Oranges", "Walls and Gates",
        "Graph Valid Tree", "Cheapest Flights Within K Stops", "Network Delay Time", "Alien Dictionary",
        "Word Ladder", "Word Ladder II", "Redundant Connection", "Number of Connected Components",
        "Is Graph Bipartite?", "Reconstruct Itinerary", "Swim in Rising Water", "Evaluate Division",
        "Find Eventual Safe States", "Minimum Height Trees", "Keys and Rooms", "As Far from Land as Possible"
    ],
    "DP": [
        "Climbing Stairs", "Min Cost Climbing Stairs", "House Robber", "House Robber II",
        "Longest Palindromic Substring DP", "Coin Change", "Coin Change II", "Maximum Product Subarray DP",
        "Word Break", "Longest Increasing Subsequence", "Partition Equal Subset Sum", "Target Sum",
        "Interleaving String", "Edit Distance", "Distinct Subsequences", "Burst Balloons", "Unique Paths",
        "Unique Paths II", "Minimum Path Sum", "Decode Ways", "Combination Sum IV", "Maximum Subarray DP",
        "Longest Common Subsequence", "Best Time to Buy Stock IV", "Regular Expression Matching DP"
    ],
    "Recursion": [
        "Subsets", "Subsets II", "Combination Sum", "Combination Sum II", "Permutations", "Permutations II",
        "Word Search", "N-Queens", "N-Queens II", "Sudoku Solver", "Palindrome Partitioning",
        "Letter Combinations of a Phone Number", "Generate Parentheses", "Restore IP Addresses", "Combinations",
        "Subset Sum", "M-Coloring Problem", "Rat in a Maze", "K-th Symbol in Grammar", "Tower of Hanoi"
    ],
    "Sorting": [
        "Merge Sort Array", "Sort An Array", "Quick Sort Partition", "Bucket Sort Colors", "Sort List Sorting",
        "Kth Largest Element in Array", "Relative Sort Array", "Custom Sort String", "Sort Colors II",
        "Wiggle Sort", "Wiggle Sort II", "Top K Frequent Words", "Merge Intervals Sorting", "Non-overlapping Intervals",
        "Meeting Rooms", "Meeting Rooms II", "Sort Transformed Array", "Largest Number",
        "Minimum Number of Arrows to Burst Balloons", "H-Index"
    ],
    "Binary Search": [
        "Binary Search", "Search a 2D Matrix", "Search a 2D Matrix II", "Koko Eating Bananas",
        "Find Minimum in Rotated Sorted Array", "Search in Rotated Sorted Array", "Time Based Key-Value Store",
        "Median of Two Sorted Arrays", "First Bad Version", "Peak Index in Mountain Array",
        "Capacity to Ship Packages", "Find Peak Element", "Search Insert Position", "Find First and Last Position",
        "Single Element in a Sorted Array", "Split Array Largest Sum", "Kth Smallest Element in Sorted Matrix",
        "Find K Closest Elements", "Arranging Coins", "Square Root x"
    ],
    "Greedy": [
        "Maximum Subarray Greedy", "Jump Game", "Jump Game II", "Gas Station", "Hand of Straights",
        "Merge Triplets to Form Target", "Partition Labels", "Valid Parenthesis String", "Task Scheduler Greedy",
        "Non-overlapping Intervals Greedy", "Assign Cookies", "Lemonade Change", "Queue Reconstruction by Height",
        "Candy", "Dota2 Senate", "Boats to Save People", "Break a Palindrome",
        "Minimum Deletions to Make Character Frequencies Unique", "Maximum Units on a Truck", "Two City Scheduling"
    ],
    "Heap": [
        "Kth Largest Element in Stream", "Last Stone Weight", "K Closest Points to Origin", "Find Median from Data Stream",
        "Reorganize String", "Task Scheduler Heap", "Smallest Range Covering Elements", "Top K Frequent Words Heap",
        "Merge K Sorted Lists Heap", "Find K Pairs with Smallest Sums", "IPO", "Process Tasks Using Servers",
        "Find Building Where Alice and Bob Can Meet", "Single-Threaded CPU", "Seat Reservation Manager"
    ],
    "Other": [
        "Single Number", "Single Number II", "Number of 1 Bits", "Counting Bits", "Reverse Bits",
        "Missing Number", "Sum of Two Integers", "Bitwise AND of Numbers Range", "Power of Two", "Power of Three",
        "Hamming Distance", "UTF-8 Validation", "Divide Two Integers", "LRU Cache Design", "LFU Cache Design",
        "Design Twitter", "Encode and Decode TinyURL", "Range Sum Query Immutable", "Design Tic-Tac-Toe", "Snapshot Array"
    ]
};

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedDatabase = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected successfully.");

        // Step A: Fetch target user dynamically
        const targetUser = await User.findOne({ email: TARGET_EMAIL.toLowerCase() });
        if (!targetUser) {
            console.error(`❌ User with email "${TARGET_EMAIL}" not found in database.`);
            console.error("Please verify the email spelling or register this user account first.");
            process.exit(1);
        }

        console.log(`Target User Found: ${targetUser.name} (${targetUser._id})`);

        // Step B: Optional cleanup of old problems for this user to avoid unwanted duplicates
        const deleteCount = await Problem.deleteMany({ userId: targetUser._id });
        console.log(`Cleared ${deleteCount.deletedCount} existing problems for this user.`);

        // Step C: Generate problem items dynamically
        const problemRecords = [];
        const now = new Date();

        Object.entries(topicsMap).forEach(([topic, titles]) => {
            titles.forEach((title) => {
                const difficulty = getRandom(difficulties);
                const platform = getRandom(platforms);
                const status = getRandom(statuses);
                const isStarred = Math.random() < 0.25; // 25% chance starred

                // Generate past date for solved problems
                const daysAgo = Math.floor(Math.random() * 60);
                const dateSolved = status === "Solved" || status === "Revise"
                    ? new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
                    : null;

                const nextRevisionDate = status === "Revise"
                    ? new Date(now.getTime() + Math.floor(Math.random() * 7 + 1) * 24 * 60 * 60 * 1000)
                    : null;

                problemRecords.push({
                    userId: targetUser._id,
                    title,
                    platform,
                    topic,
                    difficulty,
                    status,
                    notes: status !== "To Do" ? getRandom(noteTemplates) : "",
                    dateSolved,
                    isStarred,
                    tags: [topic, platform, difficulty],
                    revisionCount: status === "Revise" || status === "Solved" ? Math.floor(Math.random() * 4) + 1 : 0,
                    nextRevisionDate
                });
            });
        });

        // Step D: Batch Insert into MongoDB
        console.log(`Inserting ${problemRecords.length} problem records into MongoDB...`);
        await Problem.insertMany(problemRecords);

        console.log(`\n SUCCESS! ${problemRecords.length} DSA problems have been linked to ${TARGET_EMAIL}.`);
        process.exit(0);

    } catch (error) {
        console.error("❌ Seeding Failed:", error);
        process.exit(1);
    }
};

seedDatabase();