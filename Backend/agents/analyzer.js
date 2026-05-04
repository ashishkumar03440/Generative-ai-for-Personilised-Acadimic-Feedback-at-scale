/**
 * backend/agents/analyzer.js
 * 
 * Analyzer Agent Class
 * Performs deep semantic analysis of the cleaned student input 
 * against knowledge retrieved via RAG.
 * Now accepts optional teacher context (assignment questions) so it can
 * grade answers against the actual questions posed by the teacher.
 */

import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { getPrimaryLLM, extractJSON, withRetry, runWithLogging, truncateText } from "./utils.js";
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
     * @param {string} [input.teacherContext] - Optional OCR text from teacher's assignment PDF
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

            // Build teacher context section only when available
            const teacherContextSection = input.teacherContext && input.teacherContext.trim()
                ? `Teacher's Assignment Questions & Instructions (the student was answering these):\n${truncateText(input.teacherContext, 3000)}\n`
                : `(No teacher assignment context provided — grade based on subject knowledge and RAG context.)`;

            // Prepare the prompt by populating the variables
            const humanPrompt = ANALYZER_HUMAN_PROMPT
                .replace("{teacherContextSection}", teacherContextSection)
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
