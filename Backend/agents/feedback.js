/**
 * backend/agents/feedback.js
 * 
 * Feedback Generator Agent Class
 * Converts the objective technical analysis into strict, school-teacher style
 * feedback for the student. Passes the full scoring breakdown so the feedback
 * references every deduction by name.
 */

import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { getPrimaryLLM, extractJSON, withRetry, runWithLogging } from "./utils.js";
import { FEEDBACK_SYSTEM_PROMPT, FEEDBACK_HUMAN_PROMPT } from "./prompts/feedback.prompt.js";

export class FeedbackAgent {
    constructor() {
        this.llm = getPrimaryLLM();
    }

    /**
     * Executes the Feedback Generator agent.
     * @param {Object} input
     * @param {string} input.cleanedInput - The cleaned submission text
     * @param {Object} input.analyzerData - The JSON output from the AnalyzerAgent
     * @returns {Promise<Object>} The structured JSON strict feedback
     */
    async run(input) {
        return await runWithLogging("FeedbackAgent", async () => {
            // Stringify array data from the analyzer safely
            const safeStringify = (val) => {
                if (Array.isArray(val) && val.length > 0) return val.join("; ");
                if (typeof val === "string" && val.trim()) return val;
                return "None";
            };

            const humanPrompt = FEEDBACK_HUMAN_PROMPT
                .replace("{cleanedInput}", input.cleanedInput)
                .replace("{accuracyScore}", input.analyzerData.accuracyScore)
                .replace("{scoringBreakdown}", input.analyzerData.scoringBreakdown || "Not provided")
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
