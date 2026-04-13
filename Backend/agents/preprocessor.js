/**
 * backend/agents/preprocessor.js
 * 
 * Preprocessor Agent Class
 * Cleans, translates, and structures raw student input before analysis.
 */

import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { getPrimaryLLM, extractJSON, withRetry, runWithLogging, truncateText } from "./utils.js";
import { PREPROCESSOR_SYSTEM_PROMPT, PREPROCESSOR_HUMAN_PROMPT } from "./prompts/preprocessor.prompt.js";

export class PreprocessorAgent {
    constructor() {
        this.llm = getPrimaryLLM();
    }

    /**
     * Executes the Preprocessor agent.
     * @param {Object} input
     * @param {string} input.rawInput - The raw text/code/OCR from the user
     * @returns {Promise<Object>} The structured JSON output
     */
    async run(input) {
        return await runWithLogging("PreprocessorAgent", async () => {
            // Apply token efficiency by truncating overly massive inputs
            const safeInput = truncateText(input.rawInput, 8000);

            // Construct the messages array
            const messages = [
                new SystemMessage(PREPROCESSOR_SYSTEM_PROMPT),
                new HumanMessage(PREPROCESSOR_HUMAN_PROMPT.replace("{rawInput}", safeInput))
            ];

            // Wrap LLM invocation in the retry handler
            const response = await withRetry(async () => {
                const aiResponse = await this.llm.invoke(messages);
                return extractJSON(aiResponse.content);
            });

            return response;
        });
    }
}
