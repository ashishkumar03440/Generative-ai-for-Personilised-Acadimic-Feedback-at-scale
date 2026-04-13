# 🔍 rag — Retrieval-Augmented Generation (RAG)

> **Location:** `Backend/agents/rag/`  
> **Purpose:** Connects to a Pinecone vector database to retrieve relevant curriculum content before the AI generates feedback — grounding AI responses in real syllabus material instead of relying purely on the LLM's training data.

---

## 📁 Folder Contents

```
rag/
├── embeddings.js    # Initializes and caches the text embedding model
├── vectorStore.js   # Manages Pinecone client connection and document insertion
└── retriever.js     # Creates a LangChain retriever for similarity search
```

---

## 🧠 What is RAG?

**Retrieval-Augmented Generation (RAG)** is a technique where:

1. A knowledge base (e.g., NCERT textbooks, curriculum rubrics) is pre-processed into **vector embeddings** and stored in a vector database (Pinecone)
2. At query time, the student's submission is also embedded
3. A **similarity search** finds the most relevant curriculum passages
4. These passages are **injected into the AI prompt** as context
5. The AI generates feedback **grounded in real curriculum content** — reducing hallucinations

```
Student Answer (text)
        │
        ▼ embed()
  [0.23, -0.89, 0.41, ...]   ← query vector
        │
        ▼ similarity search
  Pinecone Vector DB ──▶ Top 5 most similar curriculum chunks
        │
        ▼
  Injected into Analyzer prompt as:
  "Relevant curriculum context: ..."
        │
        ▼
  Gemini generates curriculum-grounded analysis
```

---

## 📄 `embeddings.js` — Embedding Model

**Purpose:** Creates and caches the text embedding model used to convert text into numeric vectors.

```js
// Returns a singleton embedding model instance
export const getEmbeddingsModel = () => { ... }
```

| Detail | Value |
|--------|-------|
| Model | Google Generative AI Embeddings (via `@langchain/google-genai`) |
| API Key | `GEMINI_API_KEY` environment variable |
| Pattern | Singleton (initialized once, reused) |

**Why embeddings?** Two pieces of text with similar meaning will have vectors that are numerically **close to each other** in high-dimensional space. This enables semantic search — finding relevant content even if the exact words don't match.

---

## 📄 `vectorStore.js` — Pinecone Vector Store

**Purpose:** Manages the connection to Pinecone and exposes two functions:

### `getVectorStore()` → `PineconeStore`

Returns a LangChain `PineconeStore` connected to the configured Pinecone index. Used by the retriever to perform similarity searches.

```js
const vectorStore = await getVectorStore();
// Now ready for similarity search queries
```

### `insertDocuments(documents, namespace)` 

Inserts new curriculum documents (textbook chapters, rubrics) into Pinecone. Called when setting up or updating the curriculum knowledge base.

```js
const docs = [
  new Document({ pageContent: "Newton's first law states...", metadata: { source: "NCERT Physics Ch 9" } })
];
await insertDocuments(docs, "grade-9-physics");
```

| Environment Variable | Purpose |
|---------------------|---------|
| `PINECONE_API_KEY` | Authentication with Pinecone |
| `PINECONE_INDEX_NAME` | Which Pinecone index to use |

---

## 📄 `retriever.js` — Similarity Search Retriever

**Purpose:** Creates a LangChain retriever object that, given a query string, returns the top-K most semantically similar documents from Pinecone.

```js
const retriever = await getRetriever();
const results = await retriever.getRelevantDocuments(studentQuery);
// results = [Document { pageContent: "...", metadata: {...} }, ...]
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `k` | 5 | Number of top similar documents to retrieve |

The retrieved documents are then passed to the Analyzer prompt as curriculum context.

---

## 🔄 Full RAG Lifecycle

### One-time Setup (offline / admin task):
```
NCERT PDFs / Rubrics
        │
        ▼ chunk into paragraphs
  LangChain TextSplitter
        │
        ▼ embed each chunk
  getEmbeddingsModel()
        │
        ▼ store in Pinecone
  insertDocuments(docs)
```

### At Query Time (every student submission):
```
Student cleaned answer
        │
        ▼
  getRetriever().getRelevantDocuments(answer)
        │
        ▼
  Top-5 curriculum chunks returned
        │
        ▼
  Injected into AnalyzerAgent prompt
        │
        ▼
  Gemini produces grounded feedback
```

---

## ⚙ Dependencies

| Package | Purpose |
|---------|---------|
| `@pinecone-database/pinecone` | Native Pinecone JS client |
| `@langchain/pinecone` | LangChain wrapper for Pinecone |
| `@langchain/google-genai` | Google Generative AI embeddings |
| `langchain` | Core retriever and Document types |

---

## 🔗 Related Files

- `agents/analyzer.js` — Calls the retriever to get curriculum context
- `agents/prompts/analyzer.prompt.js` — Template that includes `{curriculumContext}` placeholder
- `.env` — Must contain `PINECONE_API_KEY` and `PINECONE_INDEX_NAME`
