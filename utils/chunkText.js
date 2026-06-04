const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters")

const chunkText = async (rawText) => {
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 50
    })

    const docs = await splitter.createDocuments([rawText])
    return docs.map((doc, index) => ({
        text: doc.pageContent,
        chunkIndex: index
    }))
}

module.exports = { chunkText }
