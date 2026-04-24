# GEO Engine: The Technical Manifesto

This document contains the absolute "Everything" regarding the logic, math, and technology powering the Generative Engine Optimization (GEO) engine.

---

## 1. High-Level Architecture: The Gated Hybrid Model
The engine operates on a **Gated Hybrid Architecture**, blending deterministic rule-based checks with probabilistic LLM perception.

### The Fusion Formula
The final score for any pillar is calculated using the following global weight distribution:
- **Baseline (Rule-Based)**: 40%
- **Refinement (LLM)**: 60%

---

## 2. Pillar 1: AI Visibility (The Structure Pillar)
**Goal**: Measure extraction confidence for AI RAG (Retrieval-Augmented Generation) pipelines.

### Deterministic Logic (Rule-Based)
*   **H1 Check**: Exactly 1 H1 = +20 pts.
*   **H2 Check**: >= 2 H2s = +20 pts.
*   **H3 Check**: >= 1 H3 = +10 pts.
*   **Paragraph Flow**: Optimal words/para: 20-150. (>150 words triggers a "Break into chunks" suggestion).
*   **List Density**: Requires >= 3 bullet/numbered items (Regex: `r'^\s*[-•*➢+]\s+|^\s*\d+\.\s+'`).
*   **Inverted Pyramid**: Analyzes first 100 words for "Direct Answer" density.

### LLM Perception Logic
*   **Metric**: `ai_friendly_formatting` (0-100).
*   **Instruction**: "Evaluate the ease of extraction. Does the content use 'hard grounding' markers that a machine chunker can anchor to?"

---

## 3. Pillar 2: Citation Worthiness (The Authority Pillar)
**Goal**: Predict the likelihood of an AI engine citing the content as a verifiable source.

### Deterministic Logic (The "Hard Grounding" Regex)
*   **Expert Mentions**: Detects names + credentials.
    *   Pattern: `r'"[^"]+" (?:says|claims|stated|according to) (?:Dr\.|Prof\.|Mr\.|Ms\.)? [A-Z][a-z]+ [A-Z][a-z]+(?:, [A-Z]{2,4}| PhD| CEO| Lead| Director)?'`
*   **Statistic Density**:
    *   Pattern: `r'\b\d+(?:\.\d+)?%|\b\d+(?:,\d{3})*(?:\.\d+)?\s+(?:percent|million|billion|thousand)\b|\b(19|20)\d{2}\b'`
    *   Target: 1.5 facts per 200 words.
*   **Citation Markers**:
    *   Patterns: `r'according to'`, `r'source:'`, `r'\[\d+\]'`, `r'\(202\d\)'`.

### LLM Perception Logic (The EEAT Matrix)
*   **Trust (40%)**: Calculated as `LLM_Trust * 0.8 + (Citations * 5 + FactDensity * 10)`.
*   **Expertise (25%)**: Calculated as `LLM_Expertise * 0.8 + (ExpertMentions * 10)`.
*   **Authoritativeness (20%)**: Direct LLM score.
*   **Experience (15%)**: Search for first-person grounding ("In my testing", "We found").

---

## 4. Pillar 3: Semantic Coverage (The Knowledge Pillar)
**Goal**: Ensure the content covers the "Expected Knowledge Graph" for a given query.

### Deterministic Logic
*   **Question Coverage**: Detects 5W1H patterns (`what`, `why`, `how`, `when`, `where`, `who`).
*   **Diversity Ratio**: `UniqueWords / TotalWords`. Target: >0.4.
*   **Keyword Density**: Threshold < 3% to avoid "Keyword Stuffing" penalties.

### LLM Perception Logic
*   **Semantic Richness (60%)**: Does the content provide "Information Gain" (new facts not found in top 5 results)?
*   **User Intent (40%)**: Evaluates the 100-word intro slice against the target query.

---

## 5. Pillar 4: Technical Readability (The UX Pillar)
**Goal**: Measure cognitive load for both LLM parsers and humans.

### Deterministic Logic
*   **Flesch Reading Ease**: Targets 60-70 (Standard 8th/9th grade).
*   **Sentence Length**: Targets 10-30 words per sentence.
*   **Active Voice Ratio**: Tolerance: < 5% passive indicators (`was`, `were`, `been`).

---

## 6. E-commerce Specific Overrides
If `content_type == 'ecommerce'`:
*   **Mandatory Schema**: `Product` schema is required. Missing = -50 pts penalty.
*   **Price Visibility**: Currency symbols (`$`, `€`, `£`) must appear in the first 200 characters.
*   **Spec Tables**: Markdown tables (`| --- |`) are worth 30 pts.
*   **Aggregation Override**: Final Semantic score is re-weighted to 30% `ProductDataCompleteness`.

---

## 7. The Action Layer (Optimizer Agent)
The `GEOOptimizer` uses specific prompts to surgically fix content.

### Strategies:
1.  **Authority Boost**: Injects placeholder expert quotes and citations.
2.  **AI Answer Mode**: Forces the "Definition-Answer" to the very top.
3.  **Semantic Expansion**: Adds missing H2/H3 sub-topics identified via "Semantic Gap Analysis."
4.  **RAG Payload (Adversarial)**: Generates a 120-word "Bullet Trap" box specifically for LLM extraction.

---

## 8. Database & Vector Schema

### SQLite Tables:
- `analysis_results`: Stores 4 pillar scores + full JSON of sub-metrics.
- `content_versions`: Stores every iteration of optimized text for A/B testing.
- `competitor_comparisons`: Stores relative gap analysis results.

### ChromaDB Schema:
- **Collection**: `geo_content_v2`
- **Embeddings**: `GoogleGenerativeAiEmbeddingFunction` (Gemini API)
- **Metadata Fields**: `content_item_id`, `heading`, `position`, `chunk_index`, `url`.
- **Chunking**: 512 tokens with 50-token overlap.

---

## 9. Full Dependency Manifest
- `fastapi`: API Orchestration.
- `chromadb`: Vector storage.
- `google-genai`: Gemini 2.5 Flash access.
- `requests/aiohttp`: Groq/External API calls.
- `textstat`: Readability calculations.
- `beautifulsoup4`: HTML parsing.
- `sqlalchemy`: Relational data management.
