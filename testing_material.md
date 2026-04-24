# GEO Intelligence Engine: Sample Testing Material

Use these snippets to test specific guardrails and scoring models implemented in the recent precision update.

---

## Sample 1: The "Structural Fail" Test
**Target:** Test if the Structural Score correctly identifies poor formatting.

> **Input Text:**
> our software is very good and you should buy it because it helps with seo and geo and makes your website faster we have many features like keyword tracking and backlink analysis and also a dashboard that shows you everything in real time it is easy to use and very affordable for everyone who wants to grow their business online without spending too much money on expensive agencies.

**What to look for:**
- **Structural Score:** Should be very low (<30).
- **Suggestions:** Should recommend adding H2s, bullet points, and better sentence structure.

---

## Sample 2: The "Hallucination Trap"
**Target:** Test if the Anti-Hallucination filter blocks the AI from making up stats.

> **Input Text:**
> The GEO tool is the fastest in the industry. Users report massive increases in their citation rates and we are significantly more effective than our competitors. Our customer satisfaction is the highest it has ever been.

**What to look for:**
- **Output:** The AI should insert `[CITATION NEEDED]` instead of saying "99% faster" or "70% increase".
- **Warning Cards:** Should appear below the results.

---

## Sample 3: The "Entity Guardrail" Test
**Target:** Verify that the AI doesn't introduce hallucinated brands or products.

> **Input Text:**
> **Title: The Future of Electric SUVs**
> The **Rivian R1S** sets a new standard for off-road electric performance. With its quad-motor setup, the Rivian delivers incredible torque. For families looking for space, the R1S is a top-tier choice in the luxury EV market.

**What to look for:**
- **Rewrite:** Does it mention "Tesla Model X" or "Lucid Gravity"?
- **Pass:** The rewrite ONLY mentions Rivian or generic terms (e.g., "the vehicle").
- **Fail:** The AI introduces new brands that weren't in the original text.

---

## Sample 4: Long-Form Context Test
**Target:** Test section-by-section rewriting and H2 preservation.

> **Input Text:**
> ## Introduction to GEO
> Generative Engine Optimization (GEO) is the next evolution of search. Unlike traditional SEO, GEO focuses on how LLMs retrieve and cite information.
> 
> ## Why Structure Matters
> Structure is critical for RAG systems. When an AI "reads" a page, it looks for clear hierarchies and semantic clusters. Clear H2 tags act as landmarks for the vector database.
> 
> ## The Role of Entities
> Entities are the building blocks of knowledge. By grounding your content in specific, verifiable entities, you increase the "grounding score" and the probability of being cited as a source.

**What to look for:**
- **H2 Headers:** Are they preserved exactly?
- **Flow:** Is there a logical connection between the "Introduction" and "Why Structure Matters" sections in the final output?

---

## Sample 5: Complex Intent Test
**Target:** Test Semantic Score and Intent Alignment.

> **Input Text:**
> "Should I use a Vector DB or a Graph DB for my RAG application? It depends on your data structure. Vector DBs excel at similarity search, while Graph DBs are better for relationship mapping."

**What to look for:**
- **Semantic Score:** Should reflect "Comparison" intent.
- **Analysis:** Does it correctly identify the intent as "Technical/Comparison"?
