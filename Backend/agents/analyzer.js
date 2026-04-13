/**
 * backend/agents/analyzer.js
 * 
 * Analyzer Agent Class
 * Performs deep semantic analysis of the cleaned student input 
 * against knowledge retrieved via RAG.
 */

import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { getPrimaryLLM, extractJSON, withRetry, runWithLogging } from "./utils.js";
import { ANALYZER_SYSTEM_PROMPT, ANALYZER_HUMAN_PROMPT } from "./prompts/analyzer.prompt.js";
import { retrieveContext } from "./rag/retriever.js";

export class AnalyzerAgent {
    constructor() {
        this.llm = getPrimaryLLM();
    }

    /**
     * Executes the Analyzer agent.
     * @param {Object} input
     * @param {string} input.cleanedInput - The cleaned text from the Preprocessor
     * @param {string} input.subjectDomain - The subject domain detected by the Preprocessor
     * @param {string} input.coreIntent - The core intent summarizing the student's submission
     * @returns {Promise<Object>} The structured JSON analysis
     */
    async run(input) {
        return await runWithLogging("AnalyzerAgent", async () => {
            // Retrieve contextual knowledge from Pinecone based on the student's core intent
            // We use the subject domain as a metadata filter to improve accuracy
            const retrievedContext = await retrieveContext(input.coreIntent, {
                k: 3,
                filter: input.subjectDomain && input.subjectDomain !== "Unknown" 
                    ? { subject: input.subjectDomain } 
                    : {}
            });

            // Prepare the prompt by populating the variables
            const humanPrompt = ANALYZER_HUMAN_PROMPT
                .replace("{retrievedContext}", retrievedContext)
                .replace("{cleanedInput}", input.cleanedInput);

            const messages = [
                new SystemMessage(ANALYZER_SYSTEM_PROMPT),
                new HumanMessage(humanPrompt)
            ];

            // Execute LLM call with retry wrapper
            const response = await withRetry(async () => {
                const aiResponse = await this.llm.invoke(messages);
                return extractJSON(aiResponse.content);
            });

            return response;
        });
    }
}
