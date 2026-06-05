
const retrieveChunks = (question, chunks, topN = 3) => {
    const words = question.toLowerCase().split(/\s+/).filter(w => w.length > 2)

    const scored = chunks.map((chunk, index) => {
        const text = chunk.text || ""
        const chunkLower = text.toLowerCase()
        const score = words.reduce((acc, word) => {
            return acc + (chunkLower.includes(word) ? 1 : 0)
        }, 0)
        return {
            text,
            chunkIndex: chunk.chunkIndex ?? index,
            score
        }
    })

    const matchingChunks = scored
        .sort((a, b) => b.score - a.score)
        .slice(0, topN)
        .filter(c => c.score > 0)

    if (matchingChunks.length > 0) return matchingChunks

    return scored
        .filter(c => c.text.trim())
        .slice(0, topN)
}

module.exports = { retrieveChunks }
