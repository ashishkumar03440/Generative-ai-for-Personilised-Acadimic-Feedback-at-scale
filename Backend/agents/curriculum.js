/**
 * backend/agents/curriculum.js
 * 
 * Curriculum Mapping Agent Class
 * Maps the identified weaknesses and missing concepts to 
 * standardized academic structures (like NCERT) and establishes a learning path.
 */

import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { getPrimaryLLM, extractJSON, withRetry, runWithLogging } from "./utils.js";
import { CURRICULUM_SYSTEM_PROMPT, CURRICULUM_HUMAN_PROMPT } from "./prompts/curriculum.prompt.js";

export class CurriculumAgent {
    constructor() {
        this.llm = getPrimaryLLM();
    }

    /**
     * Executes the Curriculum Mapping agent.
     * @param {Object} input
     * @param {string} input.subjectDomain - The subject domain
     * @param {Object} input.analyzerData - The JSON output from the AnalyzerAgent
     * @param {Object} input.validatedFeedback - The resulting JSON from the ValidatorAgent
     * @returns {Promise<Object>} The structured Curriculum Mapping JSON
     */
    async run(input) {
        return await runWithLogging("CurriculumAgent", async () => {
            const safeStringify = (arr) => Array.isArray(arr) && arr.length > 0 ? arr.join(", ") : "None";

            const humanPrompt = CURRICULUM_HUMAN_PROMPT
                .replace("{subjectDomain}", input.subjectDomain || "General Academic")
                .replace("{missingConcepts}", safeStringify(input.analyzerData.missingConcepts))
                .replace("{factualErrors}", safeStringify(input.analyzerData.factualErrors))
                .replace("{validatedFeedback}", JSON.stringify(input.validatedFeedback, null, 2));

            const messages = [
                new SystemMessage(CURRICULUM_SYSTEM_PROMPT),
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
