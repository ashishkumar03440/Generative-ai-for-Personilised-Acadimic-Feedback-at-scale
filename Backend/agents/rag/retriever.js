/**
 * backend/agents/rag/retriever.js
 * 
 * Responsible for querying the Pinecone vector store to retrieve
 * academic context, rubrics, and source material relevant to a student's submission.
 */

import { getVectorStore } from "./vectorStore.js";

/**
 * Retrieves the most relevant academic context for a given query.
 * @param {string} query - The core intent or cleaned text from the student submission.
 * @param {Object} options - Retrieval configuration options.
 * @param {number} [options.k=3] - Number of top documents to retrieve.
 * @param {Object} [options.filter={}] - Metadata filters (e.g., { subject: "Physics" }).
 * @returns {Promise<string>} - A concatenated string of the retrieved contexts ready for prompt injection.
 */
export const retrieveContext = async (query, options = {}) => {
    try {
        const k = options.k || 3;
        const filter = options.filter || {};
        
        const vectorStore = await getVectorStore();
        
        // Perform similarity search
        const results = await vectorStore.similaritySearch(query, k, filter);
        
        if (!results || results.length === 0) {
            return "No specific academic context retrieved. Analyze based on standard general knowledge of the domain.";
        }

        // Format the retrieved documents into a single string for the prompt
        let formattedContext = "=== RETRIEVED ACADEMIC CONTEXT ===\n\n";
        results.forEach((doc, index) => {
            formattedContext += `--- Source ${index + 1} ---\n`;
            if (doc.metadata && doc.metadata.source) {
                formattedContext += `Reference: ${doc.metadata.source}\n`;
            }
            formattedContext += `${doc.pageContent}\n\n`;
        });

        return formattedContext;
        
    } catch (error) {
        console.error("[Retriever Error] Failed to fetch documents from vector store:", error);
        // Fallback: Rather than breaking the entire AI pipeline, pass an empty context
        // and let the Analyzer LLM rely on its frozen knowledge base.
        return "Warning: Context retrieval failed. Analyze the submission strictly based on general factual correctness.";
    }
};
