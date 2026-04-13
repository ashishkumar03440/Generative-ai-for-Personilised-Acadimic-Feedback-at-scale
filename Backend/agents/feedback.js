/**
 * backend/agents/feedback.js
 * 
 * Feedback Generator Agent Class
 * Converts the objective technical analysis into encouraging, 
 * personalized pedagogical feedback for the student.
 */

import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { getPrimaryLLM, extractJSON, withRetry, runWithLogging } from "./utils.js";
import { FEEDBACK_SYSTEM_PROMPT, FEEDBACK_HUMAN_PROMPT } from "./prompts/feedback.prompt.js";

export class FeedbackAgent {
    constructor() {
        this.llm = getPrimaryLLM();
    }

    /**
     * Executes the Feedback Generative agent.
     * @param {Object} input
     * @param {string} input.cleanedInput - The cleaned submission text
     * @param {Object} input.analyzerData - The JSON output from the AnalyzerAgent
     * @returns {Promise<Object>} The structured JSON pedagogical feedback
     */
    async run(input) {
        return await runWithLogging("FeedbackAgent", async () => {
             // Stringify array data from the analyzer safely
            const safeStringify = (arr) => Array.isArray(arr) && arr.length > 0 ? arr.join(", ") : "None";

            const humanPrompt = FEEDBACK_HUMAN_PROMPT
                .replace("{cleanedInput}", input.cleanedInput)
                .replace("{accuracyScore}", input.analyzerData.accuracyScore)
                .replace("{strengths}", safeStringify(input.analyzerData.strengths))
                .replace("{weaknesses}", safeStringify(input.analyzerData.weaknesses))
                .replace("{missingConcepts}", safeStringify(input.analyzerData.missingConcepts))
                .replace("{factualErrors}", safeStringify(input.analyzerData.factualErrors));

            const messages = [
                new SystemMessage(FEEDBACK_SYSTEM_PROMPT),
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
