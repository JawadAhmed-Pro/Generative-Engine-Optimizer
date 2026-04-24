# GEO Intelligence Engine: User Testing & Quality Audit Plan

This plan is designed to verify the "Precision Hardening" updates. Use these test cases to audit the engine's performance and provide feedback on what is working or needs further tuning.

---

## Phase 1: Precision Scoring Audit
**Goal:** Verify that the "Visibility Analysis" is now deterministic and transparent.

### Test Case 1.1: Structural Sensitivity
1. **Input:** Paste a raw, unformatted block of text (no headers, long paragraphs).
2. **Action:** Run "Visibility Analysis".
3. **Observation:**
    - Is the **Structural Score** low (< 40)?
    - Does the hover tooltip correctly explain what is being measured?
4. **Action:** Add `<h2>` headers and break into bullet points. Run analysis again.
5. **Expected Result:** The **Structural Score** should increase significantly, while the **Semantic Score** remains relatively stable.

### Test Case 1.2: Semantic Variance
1. **Input:** Use a highly technical or academic text.
2. **Observation:**
    - Does the **Semantic Score** show a variance range (e.g., `72 ± 8`)?
    - Is the score label "Probabilistic"?

---

## Phase 2: Content Optimization Guardrails
**Goal:** Verify that the "GEO Optimizer" respects entities and prevents hallucinations.

### Test Case 2.1: Entity Guardrail (The "NER" Test)
1. **Input:** A text about "Tesla Electric Cars".
2. **Action:** Select "Authority Boost" strategy and hit "Optimize".
3. **Observation:**
    - Does the rewrite introduce random other brands (like "Ford" or "BMW") that weren't in the original?
    - **Pass:** The rewrite stays strictly focused on entities found in your source text.
    - **Fail:** The AI starts "hallucinating" new products or competitors not mentioned in the source.

### Test Case 2.2: Anti-Hallucination (The "Citation" Test)
1. **Input:** A claim like "Our software is the fastest in the world" without any data.
2. **Action:** Hit "Optimize".
3. **Observation:**
    - Does the AI "invent" a percentage (e.g., "99% faster")? **(FAILURE)**
    - Does the AI insert `[CITATION NEEDED]`? **(SUCCESS)**
    - Does a yellow **Warning Card** appear below the results?
4. **Action:** Click the "Suggested Search" link in the warning card. Does it open a relevant Google search?

---

## Phase 3: Sectioned Architecture Audit
**Goal:** Verify that long articles are processed without losing context or quality.

### Test Case 3.1: H2 Boundary Logic
1. **Input:** A long article (1000+ words) with at least 3 distinct `<h2>` sections.
2. **Action:** Hit "Optimize".
3. **Observation:**
    - Does the output maintain your original `<h2>` structure?
    - Check the transitions between sections. Do they flow logically, or do they feel like "disconnected islands"?

---

## Phase 4: Error Handling & Performance
**Goal:** Verify the system's resilience.

### Test Case 4.1: Live Dependency Check
1. **Action:** Open the browser's "Inspect Element" -> Console.
2. **Trigger:** Run an optimization.
3. **Check:** Are there any Red Errors related to `spacy` or `nlp`? (If Render installed it correctly, the backend logs should show "spaCy model loaded").

---

## Feedback Template
When reporting issues, please use this format:

> **Component:** [Scoring / Rewriting / UI]
> **What I did:** [Action]
> **What I saw:** [Result]
> **What I expected:** [Correction]
> **Sample Text used:** [Snippet]

---

### How to use this plan:
1. **Deploy:** Ensure the latest push is live on Render.
2. **Run Tests:** Go through each case.
3. **Document:** Keep a note of any "Fail" cases.
4. **Report:** Send me the list of fails so I can adjust the LLM prompts or the scoring logic.
