/**
 * backend/agents/utils.js
 * 
 * Centralized utilities for the multi-agent system.
 * Includes LLM instantiation, retry wrappers, JSON validation, and error handling.
 */

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

/**
 * Instantiates the primary LLM (Gemini 1.5 Flash) optimized for fast, structured JSON output.
 * @returns {ChatGoogleGenerativeAI}
 */
export const getPrimaryLLM = () => {
    if (!process.env.GOOGLE_API_KEY) {
        throw new Error("Missing GOOGLE_API_KEY.");
    }
    return new ChatGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_API_KEY,
        model: "gemini-3-flash-preview",
        temperature: 0.2, // Low temperature for deterministic, analytical outputs
        maxOutputTokens: 2048,
        // Enforce JSON output at the model level for Gemini
        responseMimeType: "application/json",
    });
};

/**
 * Extracts and parses JSON from an LLM response string.
 * Strips out markdown formatting like ```json ... ``` if the model hallucinated it.
 * @param {string} text 
 * @returns {Object} Parsed JSON object
 */
export const extractJSON = (text) => {
    try {
        let cleanedText = text.trim();
        if (cleanedText.startsWith("```json")) {
            cleanedText = cleanedText.replace(/^```json/, "").replace(/```$/, "").trim();
        } else if (cleanedText.startsWith("```")) {
            cleanedText = cleanedText.replace(/^```/, "").replace(/```$/, "").trim();
        }
        return JSON.parse(cleanedText);
    } catch (error) {
        throw new Error(`JSON parsing failed. Raw output: ${text.substring(0, 500)}...`);
    }
};

/**
 * A centralized retry wrapper for LLM calls to handle transient API failures or malformed JSON.
 * @param {Function} asyncFunc - The async function executing the LLM call.
 * @param {number} maxRetries - Maximum number of retries.
 * @param {number} delayMs - Delay between retries in milliseconds.
 * @returns {Promise<any>}
 */
export const withRetry = async (asyncFunc, maxRetries = 3, delayMs = 1000) => {
    let attempt = 1;
    while (attempt <= maxRetries) {
        try {
            return await asyncFunc();
        } catch (error) {
            console.warn(`[Retry Wrapper] Attempt ${attempt} failed: ${error.message}`);
            if (attempt === maxRetries) {
                throw new Error(`[Retry Wrapper] All ${maxRetries} attempts failed. Last error: ${error.message}`);
            }
            await new Promise((resume) => setTimeout(resume, delayMs * attempt));
            attempt++;
        }
    }
};

/**
 * Truncates text to fit within a specific token limit (approximate character count).
 * @param {string} text 
 * @param {number} maxChars 
 * @returns {string}
 */
export const truncateText = (text, maxChars = 10000) => {
    if (!text || text.length <= maxChars) return text || "";
    return text.substring(0, maxChars) + "\n...[TRUNCATED TO FIT CONTEXT WINDOW]";
};

/**
 * Performance logging decorator-style wrapper.
 * @param {string} agentName 
 * @param {Function} action 
 * @returns {Promise<any>}
 */
export const runWithLogging = async (agentName, action) => {
    console.log(`[${new Date().toISOString()}] 🚀 STARING AGENT: ${agentName}`);
    const start = performance.now();
    try {
        const result = await action();
        const duration = (performance.now() - start).toFixed(2);
        console.log(`[${new Date().toISOString()}] ✅ AGENT COMPLETE: ${agentName} (Time: ${duration}ms)`);
        return result;
    } catch (error) {
        const duration = (performance.now() - start).toFixed(2);
        console.error(`[${new Date().toISOString()}] ❌ AGENT FAILED: ${agentName} (Time: ${duration}ms)`);
        console.error(error);
        throw error;
    }
};
