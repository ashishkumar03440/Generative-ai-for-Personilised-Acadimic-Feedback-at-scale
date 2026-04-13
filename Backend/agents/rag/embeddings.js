/**
 * backend/agents/rag/embeddings.js
 * 
 * Provides the embedding model configuration for the RAG system.
 * Uses Google's generative AI embeddings (text-embedding-004) to align 
 * with the Gemini 1.5 Flash tech stack used in generation.
 */

import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

/**
 * Initializes and returns the embedding model instance.
 * @returns {GoogleGenerativeAIEmbeddings}
 * @throws {Error} If GOOGLE_API_KEY is not configured in the environment.
 */
export const getEmbeddingsModel = () => {
    if (!process.env.GOOGLE_API_KEY) {
        throw new Error("GOOGLE_API_KEY environment variable is missing. Cannot initialize embeddings.");
    }

    return new GoogleGenerativeAIEmbeddings({
        model: "text-embedding-004",
        // The API key is automatically picked up from process.env.GOOGLE_API_KEY
        // taskType can be left to default or set to RETRIEVAL_DOCUMENT/RETRIEVAL_QUERY depending on phase
    });
};
