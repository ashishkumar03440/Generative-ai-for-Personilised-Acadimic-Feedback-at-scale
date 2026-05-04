/**
 * backend/agents/utils.js
 * 
 * Centralized utilities for the multi-agent system.
 * Includes LLM instantiation, retry wrappers, JSON validation, and error handling.
 */

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

/**
 * Instantiates the primary LLM (Gemini 2.5 Flash) optimized for fast, structured JSON output.
 * @returns {ChatGoogleGenerativeAI}
 */
export const getPrimaryLLM = () => {
    if (!process.env.GOOGLE_API_KEY) {
        throw new Error("Missing GOOGLE_API_KEY.");
    }
    return new ChatGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_API_KEY,
        model: "gemini-2.5-flash",          // Active model within current API quota
        temperature: 0.0, // Zero temperature: deterministic, no "creative" leniency in grading
        maxOutputTokens: 4096,
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
 * Checks if an error is a rate-limit / quota error from the Gemini API.
 * These warrant a longer wait before retrying.
 * @param {Error} error
 * @returns {boolean}
 */
const isRateLimitError = (error) => {
    const msg = (error.message || "").toLowerCase();
    return (
        msg.includes("429") ||
        msg.includes("quota") ||
        msg.includes("rate limit") ||
        msg.includes("resource_exhausted") ||
        msg.includes("too many requests")
    );
};

/**
 * Checks if an error is a transient network/server error worth retrying.
 * @param {Error} error
 * @returns {boolean}
 */
const isRetryableError = (error) => {
    const msg = (error.message || "").toLowerCase();
    return (
        isRateLimitError(error) ||
        msg.includes("503") ||
        msg.includes("500") ||
        msg.includes("timeout") ||
        msg.includes("econnreset") ||
        msg.includes("socket hang up") ||
        msg.includes("network") ||
        msg.includes("json parsing failed") // malformed LLM response — worth retrying
    );
};

/**
 * A centralized retry wrapper for LLM calls to handle transient API failures or malformed JSON.
 * Uses exponential backoff with jitter to avoid thundering-herd on rate limits.
 * 
 * @param {Function} asyncFunc - The async function executing the LLM call.
 * @param {number} maxRetries - Maximum number of retries (default: 5).
 * @param {number} baseDelayMs - Base delay in milliseconds (doubles each attempt).
 * @returns {Promise<any>}
 */
export const withRetry = async (asyncFunc, maxRetries = 5, baseDelayMs = 2000) => {
    let attempt = 1;
    while (attempt <= maxRetries) {
        try {
            return await asyncFunc();
        } catch (error) {
            const isLast = attempt === maxRetries;
            const shouldRetry = !isLast && isRetryableError(error);

            console.warn(`[Retry Wrapper] Attempt ${attempt}/${maxRetries} failed: ${error.message}`);

            if (!shouldRetry) {
                throw new Error(`[Retry Wrapper] Giving up after ${attempt} attempt(s). Last error: ${error.message}`);
            }

            // Exponential backoff: 2s, 4s, 8s, 16s...
            // Rate-limit errors get double the wait time
            const exponentialDelay = baseDelayMs * Math.pow(2, attempt - 1);
            const rateLimitMultiplier = isRateLimitError(error) ? 2 : 1;
            // Add +/- 20% jitter to avoid synchronized retries
            const jitter = exponentialDelay * 0.2 * (Math.random() - 0.5);
            const waitMs = Math.round((exponentialDelay + jitter) * rateLimitMultiplier);

            console.warn(`[Retry Wrapper] ⏳ Waiting ${waitMs}ms before retry #${attempt + 1}...`);
            await new Promise((resolve) => setTimeout(resolve, waitMs));
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
    console.log(`[${new Date().toISOString()}] 🚀 STARTING AGENT: ${agentName}`);
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
