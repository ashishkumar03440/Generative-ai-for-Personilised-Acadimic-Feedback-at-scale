/**
 * backend/agents/index.js
 * 
 * Master Pipeline for EduAI
 * Orchestrates the full multi-agent sequence:
 * Preprocessor -> Analyzer -> Feedback -> Validator -> Curriculum
 */

import { PreprocessorAgent } from "./preprocessor.js";
import { AnalyzerAgent } from "./analyzer.js";
import { FeedbackAgent } from "./feedback.js";
import { ValidatorAgent } from "./validator.js";
import { CurriculumAgent } from "./curriculum.js";
import { runWithLogging } from "./utils.js";

/**
 * Executes the complete EduAI feedback generation pipeline.
 * 
 * @param {string} rawSubmission - The raw text/code/OCR submitted by the student.
 * @returns {Promise<Object>} The finalized, validated feedback and curriculum map.
 */
export const generateAcademicFeedback = async (rawSubmission) => {
    return await runWithLogging("MasterPipeline", async () => {
        if (!rawSubmission || typeof rawSubmission !== "string") {
            throw new Error("[MasterPipeline] Invalid input: rawSubmission must be a non-empty string.");
        }

        // Initialize all agents
        const preprocessor = new PreprocessorAgent();
        const analyzer = new AnalyzerAgent();
        const feedbackGen = new FeedbackAgent();
        const validator = new ValidatorAgent();
        const curriculum = new CurriculumAgent();

        const pipelineLogs = {};

        // 1. Preprocessing Phase
        // Cleans text, translates Hindi, detects subject and core intent.
        const preprocessorResult = await preprocessor.run({ rawInput: rawSubmission });
        pipelineLogs.preprocessing = preprocessorResult;

        // 2. Analysis Phase
        // Retrieves RAG context and performs deep semantic grading/analysis.
        const analyzerResult = await analyzer.run({
            cleanedInput: preprocessorResult.cleanedInput,
            subjectDomain: preprocessorResult.subjectDomain,
            coreIntent: preprocessorResult.coreIntent
        });
        pipelineLogs.analysis = analyzerResult;

        // 3. Feedback Generation Phase
        // Translates objective metrics into encouraging pedagogical feedback.
        const feedbackResult = await feedbackGen.run({
            cleanedInput: preprocessorResult.cleanedInput,
            analyzerData: analyzerResult
        });
        pipelineLogs.rawFeedback = feedbackResult;

        // 4. Validation Phase
        // Independently checks tone, safety, and JSON structure, fixing it if needed.
        const validatedResult = await validator.run({
            feedbackPayload: feedbackResult
        });
        pipelineLogs.validatedFeedback = validatedResult;

        // 5. Curriculum Mapping Phase
        // Maps weaknesses to strict learning paths/NCERT modules.
        const curriculumResult = await curriculum.run({
            subjectDomain: preprocessorResult.subjectDomain,
            analyzerData: analyzerResult,
            validatedFeedback: validatedResult
        });
        pipelineLogs.curriculumPath = curriculumResult;

        // Construct the final comprehensive payload
        return {
            status: "success",
            timestamp: new Date().toISOString(),
            data: {
                studentSubmission: {
                    original: rawSubmission,
                    cleaned: preprocessorResult.cleanedInput,
                    language: preprocessorResult.originalLanguage,
                    subject: preprocessorResult.subjectDomain
                },
                metrics: {
                    accuracyScore: analyzerResult.accuracyScore,
                    rubricAlignment: analyzerResult.rubricAlignment,
                    hasCode: preprocessorResult.hasCode
                },
                feedback: validatedResult,
                learningPath: curriculumResult,
            },
            // Include internal logs for debugging or admin dashboard views
            _internalDiagnostics: pipelineLogs
        };
    });
};

export default generateAcademicFeedback;
