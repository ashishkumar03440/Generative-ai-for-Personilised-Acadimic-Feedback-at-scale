# 💬 prompts — AI Agent Prompt Templates

> **Location:** `Backend/agents/prompts/`  
> **Purpose:** Stores the system prompts and user prompt templates for each AI agent in the pipeline. Separating prompts from code makes them easy to tune and iterate without touching application logic.

---

## 📁 Folder Contents

```
prompts/
├── preprocessor.prompt.js   # Stage 1: Prompt for cleaning and classifying student input
├── analyzer.prompt.js       # Stage 2: Prompt for grading against curriculum context
├── feedback.prompt.js       # Stage 3: Prompt for generating teacher-like feedback
├── validator.prompt.js      # Stage 4: Prompt for safety and quality validation
└── curriculum.prompt.js     # Stage 5: Prompt for mapping weaknesses to learning paths
```

---

## 📐 Prompt File Structure

Every prompt file follows the same pattern and exports two constants:

```js
// SYSTEM PROMPT — Sets the agent's role, persona, rules, and output schema
export const AGENT_SYSTEM_PROMPT = `
  You are the [AgentName] for EduAI. Your role is...
  OUTPUT REQUIREMENTS: You MUST output ONLY valid JSON...
  JSON SCHEMA: { ... }
`;

// HUMAN / USER PROMPT — Template filled with actual student data at runtime
export const AGENT_HUMAN_PROMPT = `
  Process the following student submission:
  {placeholder}
  Return the strict JSON output.
`;
```

The `{placeholder}` values are replaced at runtime by the agent before sending to Gemini.

---

## 📄 Prompt Descriptions

### `preprocessor.prompt.js`
**Agent:** PreprocessorAgent  
**System role:** A linguistic preprocessing and classification expert.

**Tasks instructed:**
- Detect if the submission is in Hindi or English
- Translate Hindi to English if needed
- Remove noise (extra whitespace, formatting artifacts)
- Identify the academic subject domain (Mathematics, Science, History, etc.)
- Extract the core intent of the answer (what concept is being answered)
- Detect if the submission contains code

**Output schema:**
```json
{
  "cleanedInput": "...",
  "originalLanguage": "Hindi | English",
  "subjectDomain": "Mathematics",
  "coreIntent": "...",
  "hasCode": false
}
```

---

### `analyzer.prompt.js`
**Agent:** AnalyzerAgent  
**System role:** A strict academic evaluator and subject-matter expert.

**Tasks instructed:**
- Evaluate the student's answer against the provided curriculum context (retrieved via RAG)
- Score accuracy from 0–100
- Identify specific factual errors with the correct information
- Identify strengths
- Rate rubric alignment

**Output schema:**
```json
{
  "accuracyScore": 72,
  "rubricAlignment": "Partial",
  "strengths": ["..."],
  "errors": [{ "studentStatement": "...", "correction": "..." }],
  "curriculumReference": "..."
}
```

---

### `feedback.prompt.js`
**Agent:** FeedbackAgent  
**System role:** An empathetic, experienced teacher writing feedback for a student.

**Tasks instructed:**
- Convert the analyzer's objective metrics into warm, readable paragraphs
- Never mention scores or numeric grades directly — focus on growth language
- Use encouraging, non-demeaning language
- Be specific about what the student did well

**Output schema:**
```json
{
  "feedbackSummary": "...",
  "whatWentWell": "...",
  "areasForImprovement": "...",
  "actionableSteps": ["...", "..."],
  "recommendedStudyTopics": ["...", "..."],
  "encouragingClosing": "..."
}
```

---

### `validator.prompt.js`
**Agent:** ValidatorAgent  
**System role:** A quality assurance auditor — the final safety and structure check.

**Tasks instructed:**
1. **Safety Check** — Does the feedback contain toxic, demoralizing, or harmful language?
2. **Pedagogy Check** — Does it sound like a real teacher, or like AI hallucination?
3. **Format Check** — Is it valid JSON matching the required schema?
4. **Fix Issues** — If `isValid = false`, rewrite the feedback to fix all problems

**Output schema:**
```json
{
  "isValid": true,
  "reason": "All checks passed.",
  "correctedFeedback": { ...same schema as feedback.prompt output... }
}
```

---

### `curriculum.prompt.js`
**Agent:** CurriculumAgent  
**System role:** A curriculum expert who maps student weaknesses to a structured study plan.

**Tasks instructed:**
- Analyze the errors identified by the Analyzer
- Map each weakness to a specific NCERT chapter, topic, or module
- Generate an ordered, step-by-step learning path
- Include resource suggestions where possible

**Output schema:**
```json
{
  "learningPath": [
    {
      "topic": "Laws of Motion",
      "module": "NCERT Class 9 Physics, Chapter 9",
      "reason": "Student confused velocity with acceleration",
      "studySteps": ["Read Chapter 9.3", "Solve example 9.2"]
    }
  ]
}
```

---

## 🎯 Why Prompts Are Separated from Code

| Benefit | Explanation |
|---------|-------------|
| **Iterability** | Tweak prompt wording without touching JS logic |
| **Readability** | Agents stay clean; prompts are long text, not code |
| **Testing** | Prompts can be tested directly in Gemini AI Studio |
| **Version control** | Prompt changes are clearly visible in git diffs |

---

## 🔗 Related Files

- `agents/preprocessor.js` — Imports `preprocessor.prompt.js`
- `agents/analyzer.js` — Imports `analyzer.prompt.js`
- `agents/feedback.js` — Imports `feedback.prompt.js`
- `agents/validator.js` — Imports `validator.prompt.js`
- `agents/curriculum.js` — Imports `curriculum.prompt.js`
