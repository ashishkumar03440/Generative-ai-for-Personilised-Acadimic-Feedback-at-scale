/**
 * backend/agents/preprocessor.js
 * 
 * Preprocessor Agent Class
 * Cleans, translates, and structures raw student input before analysis.
 * Now accepts optional teacher context (assignment questions) for
 * question-aware preprocessing and intent extraction.
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
     * @param {string} input.rawInput - The raw text/code/OCR from the student (may include handwriting)
     * @param {string} [input.teacherContext] - Optional OCR text from teacher's assignment PDF
     * @returns {Promise<Object>} The structured JSON output
     */
    async run(input) {
        return await runWithLogging("PreprocessorAgent", async () => {
            // Apply token efficiency by truncating overly massive inputs
            const safeInput = truncateText(input.rawInput, 8000);

            // Build teacher context section only when available
            const teacherContextSection = input.teacherContext && input.teacherContext.trim()
                ? `Teacher's Assignment Questions & Instructions (use this to understand what the student was asked):\n${truncateText(input.teacherContext, 3000)}\n`
                : `(No teacher assignment context provided — evaluate the student's submission on its own merits.)`;

            // Populate prompt template
            const humanPrompt = PREPROCESSOR_HUMAN_PROMPT
                .replace("{teacherContextSection}", teacherContextSection)
                .replace("{rawInput}", safeInput);

            const messages = [
                new SystemMessage(PREPROCESSOR_SYSTEM_PROMPT),
                new HumanMessage(humanPrompt)
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
