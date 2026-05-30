
const SPACING = [1, 3, 7, 14, 30]

const getNextRevisionDate = (revisionCount) => {
    const days = SPACING[revisionCount] ?? 30
    const next = new Date()
    next.setDate(next.getDate() + days)
    next.setHours(23, 59, 59, 999)
    return next
}

module.exports = { getNextRevisionDate }