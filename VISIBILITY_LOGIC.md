# ULTIMATE SPEC: GEO Visibility Analysis Engine (Deep Dive)

This document contains the absolute technical "truth" of the GEO Visibility Analysis engine. It details the exact mathematical formulas, regex patterns, and scoring thresholds used in the system.

---

## 1. The Gated Scoring Architecture (The Math)

The system uses a **weighted fusion model** where deterministic rule-based checks act as a "baseline" and probabilistic LLM evaluations act as a "refinement."

**Global Weighting:**
*   **Rule-Based Weight**: 40% (`self.rule_weight = 0.4`)
*   **LLM Weight**: 60% (`self.llm_weight = 0.6`)

### Pillar Formulas:
1.  **AI Visibility Score**
    *   `Baseline = (Structure_Score * 0.7) + (Schema_Score * 0.3)`
    *   `Refinement = (LLM_AI_Formatting * 0.5) + (LLM_Structural_Integrity * 0.5)`
    *   `Final = (Baseline * 0.4) + (Refinement * 0.6)`

2.  **Citation Worthiness Score**
    *   `Baseline = Rule_Authority_Score`
    *   `Refinement = (LLM_Content_Authority * 0.5) + (Overall_EEAT * 0.5)`
    *   `Final = (Baseline * 0.4) + (Refinement * 0.6)`

3.  **Semantic Coverage Score**
    *   `Baseline = Rule_Keyword_Score`
    *   `Refinement = (LLM_Semantic_Richness * 0.6) + (LLM_User_Intent * 0.4)`
    *   `Final = (Baseline * 0.4) + (Refinement * 0.6)`
    *   *Note: For E-commerce, this is re-weighted: (Final * 0.7) + (Product_Data_Completeness * 0.3).*

4.  **Technical Readability Score**
    *   `Baseline = Rule_Readability_Score`
    *   `Refinement = LLM_Readability_UX`
    *   `Final = (Baseline * 0.4) + (Refinement * 0.6)`

---

## 2. Rule-Based Heuristics (`rule_based.py`)

### Structural Score Thresholds:
*   **H1**: +20 pts (Exact count: 1).
*   **H2**: +20 pts (Minimum: 2).
*   **H3**: +10 pts (Minimum: 1).
*   **Paragraphs**: +20 pts (Avg length: 20-150 words).
*   **Lists**: +15 pts (Regex: `^\s*[-•*➢+]\s+|^\s*\d+\.\s+`).
*   **E-com Price**: +20 pts (Currency found in first 200 chars).
*   **E-com Spec Table**: +30 pts (Markdown table `|` + `---`).

### Authority (EEAT) Signals:
*   **Expert Mentions**: +30 pts (Threshold: 2+).
    *   *Quote Regex*: `"[^"]+" (?:says|claims|stated|according to) (?:Dr\.|Prof\.|Mr\.|Ms\.)? [A-Z][a-z]+ [A-Z][a-z]+(?:, [A-Z]{2,4}| PhD| CEO| Lead| Director)?`
    *   *Credential Regex*: `\b(PhD|M\.D\.|M\.S\.|CEO|CTO|Scientist|Professor|Head of|Director of|Founder)\b`
*   **Fact Density**: +30 pts (Threshold: 1.5 facts per 200 words).
    *   *Stat Regex*: `\b\d+(?:\.\d+)?%|\b\d+(?:,\d{3})*(?:\.\d+)?\s+(?:percent|million|billion|thousand)\b|\b(19|20)\d{2}\b`
*   **Inline Citations**: +20 pts (Threshold: 3+).
    *   *Patterns*: `according to`, `source:`, `[0-9]+`, `(202[0-9])`.

### Schema & Entity Linking:
*   **Product Schema**: +40 pts (Mandatory for Ecom).
*   **Entity Linking (`sameAs`)**: +20 pts (Regex: `'sameas'` in raw schema).
*   **Recency (2025 Factor)**: +50 pts (Regex: `\b(2025|2026)\b`).

---

## 3. LLM Evaluator Logic (`llm_scorer.py`)

### The "Intent Alignment Gate" (Binary Check)
We feed the **first 100 words** of the content to the LLM and ask: *"Does this slice directly answer the query '[Query]'?"* If the answer is No, the score suffers a massive penalty in the "Intent Alignment" metric.

### EEAT Metric Weights:
The LLM scores the following, which are then fused in the aggregator:
1.  **Trustworthiness (40%)**: Assessed by absence of fluff and presence of safety warnings/data.
2.  **Expertise (25%)**: Use of domain methodology and LSI terminology.
3.  **Authoritativeness (20%)**: Signals of primary source authority.
4.  **Experience (15%)**: First-person grounding ("In my testing", "I found").

### Adversarial Evaluation Prompt:
The models are instructed with the following constraints:
*   *"You are an OBJECTIVE AUDITOR. Grade fairly based on 2025 industry standards."*
*   *"Score 0-49 for thin/unstructured content."*
*   *"Score 86-100 ONLY for exceptional, highly cited, novel data."*

---

## 4. Citation Probability Model (`probability_model.py`)
Visibility is ultimately expressed as a **% Citation Likelihood**.
*   This is a sigmoid-based calculation that takes the `Pillar Scores` and calculates the distance to the "Ideal GEO Profile."
*   **Primary Driver**: AI Visibility Score (Structural Confidence).
*   **Secondary Driver**: Content Authority (Grounding Confidence).

---

## 5. Technology Specs
*   **Evaluators**: Gemini-2.5-Flash (Async) & Llama-3.3-70b (via Groq LP-API).
*   **Vector DB**: ChromaDB with `PersistentClient`.
*   **Chunking**: Recursive Character Splitter (512 tokens / 50 overlap).
*   **Memory**: Google GenAI Embeddings (Low RAM footprint, High Semantic Resolution).
