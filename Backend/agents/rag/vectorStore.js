/**
 * backend/agents/rag/vectorStore.js
 * 
 * Configures the Pinecone vector database tailored for LangChain.js.
 * Responsible for managing the connection to Pinecone and providing 
 * the VectorStore interface used for document insertion and similarity search.
 */

import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { getEmbeddingsModel } from "./embeddings.js";

let pineconeClientInstance = null;

/**
 * Initializes and caches the native Pinecone client.
 * @returns {Pinecone}
 */
const getPineconeClient = () => {
    if (!pineconeClientInstance) {
        if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX_NAME) {
            throw new Error("Missing Pinecone environment variables (PINECONE_API_KEY, PINECONE_INDEX_NAME).");
        }
        
        pineconeClientInstance = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY,
        });
    }
    return pineconeClientInstance;
};

/**
 * Returns an instance of the LangChain PineconeStore connected to our index.
 * @returns {Promise<PineconeStore>}
 */
export const getVectorStore = async () => {
    const pinecone = getPineconeClient();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);
    const embeddings = getEmbeddingsModel();

    // Create a LangChain vector store wrapper around the Pinecone index
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex,
        // Optional prefix or namespace mapping for specific subjects
        // namespace: "grade-10-science" 
    });

    return vectorStore;
};

/**
 * Utility to insert new textbook/rubric documents into the vector store.
 * @param {Array} documents - Array of LangChain Document objects
 * @param {string} namespace - Optional namespace (e.g., specific curriculum module)
 */
export const insertDocuments = async (documents, namespace = "default") => {
    const pinecone = getPineconeClient();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);
    const embeddings = getEmbeddingsModel();

    await PineconeStore.fromDocuments(documents, embeddings, {
        pineconeIndex,
        namespace,
    });
};
