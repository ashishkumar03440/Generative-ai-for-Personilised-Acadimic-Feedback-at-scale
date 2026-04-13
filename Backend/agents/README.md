# 🤖 agents — AI Multi-Agent Feedback Pipeline

> **Location:** `Backend/agents/`  
> **Purpose:** Orchestrates a 5-stage AI pipeline that processes a student's raw submission and produces structured, validated, personalised pedagogical feedback.

---

## 📁 Folder Contents

```
agents/
├── index.js          # 🎯 Master orchestrator — runs the full pipeline
├── preprocessor.js   # Stage 1: Clean, translate, classify input
├── analyzer.js       # Stage 2: RAG retrieval + semantic grading
├── feedback.js       # Stage 3: Generate teacher-like written feedback
├── validator.js      # Stage 4: Safety, tone, and JSON structure check
├── curriculum.js     # Stage 5: Map weaknesses to NCERT learning path
├── utils.js          # Shared utilities: logging, error wrapping
├── package.json      # Agent-specific dependencies
│
├── prompts/          # System & user prompt templates for each agent
└── rag/              # Pinecone vector store and RAG retriever
```

---

## 🔄 Pipeline Flow

```
rawSubmission  (student text / OCR'd PDF)
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  Stage 1: PreprocessorAgent                              │
│  • Removes noise and formatting artefacts                │
│  • Detects original language (Hindi / English)           │
│  • Translates Hindi → English if needed                  │
│  • Identifies subject domain (Math, Science, etc.)       │
│  • Extracts core intent of the submission                 │
└──────────────────────────┬───────────────────────────────┘
                           │ { cleanedInput, subjectDomain, coreIntent, hasCode }
                           ▼
┌──────────────────────────────────────────────────────────┐
│  Stage 2: AnalyzerAgent                                  │
│  • Calls RAG retriever → fetches relevant curriculum     │
│  • Sends student answer + curriculum context to Gemini   │
│  • Scores accuracy (0–100) and rubric alignment          │
│  • Identifies specific factual errors and strengths      │
└──────────────────────────┬───────────────────────────────┘
                           │ { accuracyScore, rubricAlignment, strengths, errors }
                           ▼
┌──────────────────────────────────────────────────────────┐
│  Stage 3: FeedbackAgent                                  │
│  • Converts objective metrics into warm written feedback │
│  • Uses the tone of an encouraging, experienced teacher  │
│  • Produces structured JSON: summary, strengths,         │
│    improvements, action steps, study topics              │
└──────────────────────────┬───────────────────────────────┘
                           │ { feedbackSummary, whatWentWell, areasForImprovement, ... }
                           ▼
┌──────────────────────────────────────────────────────────┐
│  Stage 4: ValidatorAgent                                 │
│  • Independently audits the feedback                     │
│  • Checks: toxic/demoralizing language, hallucinations   │
│  • Checks: valid JSON structure matches required schema  │
│  • If isValid = false → rewrites the feedback to fix it  │
└──────────────────────────┬───────────────────────────────┘
                           │ { isValid, correctedFeedback }
                           ▼
┌──────────────────────────────────────────────────────────┐
│  Stage 5: CurriculumAgent                                │
│  • Takes identified weaknesses from Analyzer             │
│  • Maps them to specific NCERT chapters / modules        │
│  • Produces an ordered learning path for the student     │
└──────────────────────────┬───────────────────────────────┘
                           │ { learningPath: [...] }
                           ▼
               Final Comprehensive JSON Payload
```

---

## 📄 File Descriptions

### `index.js` — Master Orchestrator

The public-facing function `generateAcademicFeedback(rawSubmission)`:

1. Validates that input is a non-empty string
2. Instantiates all 5 agents
3. Runs each agent in strict sequence (one fails → pipeline halts)
4. Collects results into `pipelineLogs` for debugging
5. Returns a structured JSON payload:

```json
{
  "status": "success",
  "timestamp": "2024-...",
  "data": {
    "studentSubmission": { "original", "cleaned", "language", "subject" },
    "metrics": { "accuracyScore", "rubricAlignment", "hasCode" },
    "feedback": { ...validatedFeedback },
    "learningPath": { ...curriculumResult }
  },
  "_internalDiagnostics": { ...pipelineLogs }
}
```

---

### `preprocessor.js` — PreprocessorAgent

- Receives: `{ rawInput: string }`
- Returns: `{ cleanedInput, originalLanguage, subjectDomain, coreIntent, hasCode }`
- Uses the prompt in `prompts/preprocessor.prompt.js`

---

### `analyzer.js` — AnalyzerAgent

- Receives: `{ cleanedInput, subjectDomain, coreIntent }`
- Queries the RAG retriever for relevant curriculum passages
- Injects curriculum context into the Gemini prompt
- Returns: `{ accuracyScore, rubricAlignment, strengths[], errors[], curriculumReference }`

---

### `feedback.js` — FeedbackAgent

- Receives: `{ cleanedInput, analyzerData }`
- Returns: structured feedback JSON (summary, what went well, improvements, steps, topics, closing)
- Uses the prompt in `prompts/feedback.prompt.js`

---

### `validator.js` — ValidatorAgent

- Receives: `{ feedbackPayload }`
- Returns: `{ isValid, reason, correctedFeedback }`
- If `isValid === false`, `correctedFeedback` is the agent's rewritten/fixed version
- Uses the prompt in `prompts/validator.prompt.js`

---

### `curriculum.js` — CurriculumAgent

- Receives: `{ subjectDomain, analyzerData, validatedFeedback }`
- Returns: `{ learningPath: [{ module, topic, resources }] }`
- Uses the prompt in `prompts/curriculum.prompt.js`

---

### `utils.js` — Shared Utilities

Provides `runWithLogging(agentName, asyncFn)`:
- Wraps every agent call with structured timing logs
- Catches and re-throws errors with clear agent-name context for debugging

---

## ⚙ Dependencies

| Package | Purpose |
|---------|---------|
| `@google/generative-ai` or `@langchain/google-genai` | Gemini LLM calls |
| `langchain` | Agent and chain orchestration |
| `@langchain/pinecone` | Pinecone vector store integration |
| `@pinecone-database/pinecone` | Native Pinecone client |

---

## 🔗 Related Folders

- [`prompts/README.md`](./prompts/README.md) — Prompt templates for each agent
- [`rag/README.md`](./rag/README.md) — RAG vector store and retriever
- `Middleware/SubmittedMiddleware.js` — Entry point that calls `generateAcademicFeedback()`
