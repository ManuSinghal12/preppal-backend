const getEmbedding = async (text) => {
    try {
        if (!process.env.HF_TOKEN) {
            throw new Error("HF_TOKEN is missing in your .env file");
        }

        const response = await fetch(
            "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.HF_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ inputs: text }),
            }
        );

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Hugging Face API returned status ${response.status}: ${errorBody}`);
        }

        let embedding = await response.json();

        if (Array.isArray(embedding) && Array.isArray(embedding[0])) {
            embedding = embedding[0];
        }

        if (!Array.isArray(embedding) || embedding.length !== 384) {
            throw new Error(`Invalid embedding vector dimension received. Expected 384, got ${embedding?.length}`);
        }

        return embedding;
    } catch (error) {
        console.error("Embedding Extraction Error:", error.message);
        throw error;
    }
};

module.exports = { getEmbedding };