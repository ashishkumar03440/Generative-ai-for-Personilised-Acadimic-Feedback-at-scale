/**
 * backend/agents/ocr.js
 *
 * OCR Utility — Gemini Native Multimodal PDF Reader
 *
 * Uses Google Gemini's multimodal vision to extract text from PDFs,
 * including scanned documents and handwritten notes.
 *
 * Strategy:
 *  1. Try pdf-parse first (fast, free for digital PDFs with text layer).
 *  2. If result is too short (< 80 chars) or empty, fall back to Gemini
 *     multimodal: send raw PDF bytes inline and ask Gemini to OCR all pages.
 *
 * This means:
 *  - Digital PDFs with text layer: handled instantly by pdf-parse.
 *  - Scanned / handwritten PDFs: handled by Gemini vision (reads handwriting).
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { createRequire } from "module";

// Need require() to load CommonJS pdf-parse from within an ESM module
const require = createRequire(import.meta.url);

// ─── Gemini client for OCR (separate from LangChain) ─────────────────────────
const getOCRClient = () => {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("[OCR] Missing GOOGLE_API_KEY or GEMINI_API_KEY in environment.");
    }
    return new GoogleGenerativeAI(apiKey);
};

/**
 * OCR a PDF file using Gemini's native multimodal PDF reading.
 * Gemini reads every page including handwritten text, diagrams, tables.
 *
 * @param {string} filePath - Absolute or relative path to the PDF file.
 * @param {string} role - "student" | "teacher" — used for logging context only.
 * @returns {Promise<string>} - The extracted text content.
 */
const ocrWithGemini = async (filePath, role = "unknown") => {
    console.log(`[OCR] 🔍 Running Gemini multimodal OCR on [${role}] PDF: ${path.basename(filePath)}`);

    const genAI = getOCRClient();
    // Use gemini-2.5-flash — confirmed within current API quota
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const pdfBytes = fs.readFileSync(filePath);
    const base64PDF = pdfBytes.toString("base64");

    const prompt = `You are an expert OCR assistant. Your task is to transcribe ALL text visible in this PDF document.

Instructions:
- Extract EVERY line of text from ALL pages in the correct reading order.
- This may include printed text, handwritten notes, mathematical equations, diagrams with labels, and tables.
- If the text is handwritten, transcribe it faithfully — do not skip unclear sections, write [illegible] if truly unreadable.
- For mathematical content: use plain text notation (e.g., "x^2 + 3x - 5 = 0").
- For tables: transcribe row by row, separating columns with " | ".
- Preserve paragraph/question structure (e.g., Q1: ..., Q2: ..., Answer: ...).
- Do NOT add any commentary, greetings, or explanations. Output ONLY the transcribed text.
- If a page is blank, write "[BLANK PAGE]".
- Separate pages with "--- PAGE {n} ---".

Begin transcription now:`;

    const result = await model.generateContent([
        {
            inlineData: {
                mimeType: "application/pdf",
                data: base64PDF,
            },
        },
        prompt,
    ]);

    const text = result.response.text().trim();
    console.log(`[OCR] ✅ Gemini OCR complete for [${role}] PDF. Extracted ${text.length} characters.`);
    return text;
};

/**
 * Main export: Extract text from a PDF using a smart two-stage strategy.
 *
 * Stage 1 — pdf-parse: Fast, free, handles digital PDFs.
 * Stage 2 — Gemini Vision: Handles scanned/handwritten PDFs.
 *
 * @param {string} filePath - Path to the PDF file on disk.
 * @param {string} role - "student" | "teacher" for logging.
 * @returns {Promise<string>} - Extracted text, never throws.
 */
export const extractTextFromPDF = async (filePath, role = "unknown") => {
    // ── Stage 1: Try pdf-parse (text-layer PDFs) ─────────────────────────────
    try {
        // Use createRequire to load CommonJS pdf-parse from within ESM module
        // Import from the lib path directly to avoid pdf-parse's test-file checks
        const pdfParse = require("pdf-parse/lib/pdf-parse.js");
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer, { max: 0 });
        const rawText = (pdfData.text || "").trim();

        if (rawText.length >= 80) {
            console.log(`[OCR] ✅ pdf-parse succeeded for [${role}] PDF. Length: ${rawText.length} chars.`);
            return rawText;
        }

        // Text layer too thin (likely scanned or handwritten) — fall through to Gemini
        console.log(`[OCR] ⚠️  pdf-parse returned thin text (${rawText.length} chars) for [${role}] PDF. Escalating to Gemini OCR.`);
    } catch (parseErr) {
        console.warn(`[OCR] ⚠️  pdf-parse failed for [${role}] PDF: ${parseErr.message}. Escalating to Gemini OCR.`);
    }

    // ── Stage 2: Gemini multimodal OCR ───────────────────────────────────────
    try {
        const ocrText = await ocrWithGemini(filePath, role);
        if (ocrText && ocrText.length > 0) {
            return ocrText;
        }
        return `(OCR returned empty content for ${path.basename(filePath)}. Please check the file.)`;
    } catch (ocrErr) {
        console.error(`[OCR] ❌ Gemini OCR also failed for [${role}] PDF: ${ocrErr.message}`);
        return `(Both pdf-parse and Gemini OCR failed for "${path.basename(filePath)}". Error: ${ocrErr.message})`;
    }
};
