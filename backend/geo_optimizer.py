import aiohttp
import json
import re
import textstat
from bs4 import BeautifulSoup
from typing import Dict, Any, List
from config import settings
from logger import app_logger

class GEOOptimizer:
    """The 'Action Layer' - AI Agent that rewrites content for GEO optimization."""
    
    def __init__(self):
        self.groq_api_key = settings.GROQ_API_KEY
        self.gemini_api_key = settings.GEMINI_API_KEY
        self.nlp = None
        try:
            import spacy
            self.nlp = spacy.load("en_core_web_sm")
        except Exception as e:
            app_logger.warning(f"spaCy load failed (expected in local dev): {e}")

    def _extract_entities(self, content: str) -> List[str]:
        """FIX 4: Extract named entities from content."""
        if not self.nlp:
            # Fallback to regex if spacy is unavailable
            return list(set(re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', content)))
        
        doc = self.nlp(content)
        return list(set([ent.text for ent in doc.ents]))

    async def rewrite(self, content: str, strategy: str = 'general', tone: str = 'professional', audience: str = 'intermediate', strength: int = 50, target_query: str = "") -> Dict[str, Any]:
        """
        FIX 2: Section-by-Section Rewriting with FIX 1 (Anti-Hallucination) and FIX 4 (Entity Guardrails).
        """
        app_logger.info(f"Agent: Section-by-section rewrite for strategy: {strategy}")
        
        # 1. Build Page Context
        entities = self._extract_entities(content)
        page_context = {
            "target_query": target_query or "General optimization",
            "page_intent": "informational" if "how" in content.lower() else "comparison" if "vs" in content.lower() else "commercial",
            "core_entities": entities[:5],
            "word_count": len(content.split()),
            "allowed_entity_pool": entities
        }

        # 2. Split content by H2 sections
        sections = re.split(r'(<h2.*?>.*?</h2>|## .*?\n)', content, flags=re.IGNORECASE | re.DOTALL)
        
        processed_sections = []
        all_missing_citations = []
        all_changes = []
        
        # Re-group headers with their following text
        grouped_sections = []
        current_group = ""
        for sec in sections:
            if re.match(r'(<h2|## )', sec):
                if current_group:
                    grouped_sections.append(current_group)
                current_group = sec
            else:
                current_group += sec
        if current_group:
            grouped_sections.append(current_group)

        # 3. Process each section
        for section in grouped_sections:
            if not section.strip(): continue
            
            # Extract header if present
            header_match = re.match(r'(<h2.*?>.*?</h2>|## .*?\n)', section, flags=re.IGNORECASE | re.DOTALL)
            h2_text = header_match.group(0) if header_match else "General Section"
            section_content = section[len(h2_text):] if header_match else section

            rewrite_prompt = f"""
            Act as a GEO Content Editor. You are rewriting ONE section of a larger article.
            
            PAGE CONTEXT: {json.dumps(page_context)}
            SECTION HEADING: {h2_text}
            STRATEGY: {strategy}
            TONE: {tone}
            
            RULES:
            1. Optimize for AI search visibility and citation probability.
            2. ENTITY GUARDRAIL: Only use entities from this list: {page_context['allowed_entity_pool']}. Do not introduce new ones.
            8. ANTI-HALLUCINATION RULE: 
               If a claim already contains a statistic from the original content, preserve it exactly.
               If a claim has no statistic, do NOT invent one.
               Instead, append a tag: [CITATION NEEDED: <what type of source would support this claim>]
               Never generate percentages, figures, or numerical data that were not in the original input.
            9. Stay scoped to this section. Do not reference other sections.
            
            Section Content:
            ---
            {section_content}
            ---
            
            Return JSON:
            {{
                "optimized_section": "...",
                "missing_citations": ["..."],
                "changes": ["..."]
            }}
            """
            result = await self._call_llm(rewrite_prompt)
            processed_sections.append(h2_text + "\n" + result.get("optimized_section", section_content))
            all_missing_citations.extend(result.get("missing_citations", []))
            all_changes.extend(result.get("changes", []))

        # 4. Final Smoothing Pass (Lightweight)
        full_content = "\n\n".join(processed_sections)
        smoothing_prompt = f"""
        Act as a final editor. Smooth the transitions between the following sections. 
        Do NOT rewrite the core content. Only adjust the first/last sentences of sections if needed for flow.
        Return the full smoothed content.
        
        Content:
        ---
        {full_content[:6000]}
        ---
        """
        # Smoothing can be a simpler text response or JSON
        final_result = await self._call_llm(smoothing_prompt)
        smoothed_content = final_result.get("optimized_content", full_content) if isinstance(final_result, dict) else full_content

        # 5. Final Scoring (FIX 3)
        structural = self.get_structural_score(smoothed_content)
        semantic = await self.get_semantic_score(smoothed_content)

        # 6. Post-Rewrite Entity Check (FIX 4 Step 5)
        new_entities = self._extract_entities(smoothed_content)
        hallucinated = [ent for ent in new_entities if ent not in page_context["allowed_entity_pool"]]
        if hallucinated:
            all_changes.append(f"WARNING: Hallucinated entities detected: {hallucinated}")

        # 7. Extract Citation Flags
        final_clean_content, citation_warnings = self.extract_citation_flags(smoothed_content)

        return {
            "optimized_content": final_clean_content,
            "changes_made": list(set(all_changes)),
            "missing_citations": list(set(all_missing_citations + citation_warnings)),
            "citation_warnings": citation_warnings,
            "structural_score": structural,
            "semantic_score": semantic,
            "geo_lift_estimate": f"Estimated +{structural['score']}% structural lift"
        }

    async def generate_rag_payload(self, content: str, target_keyword: str) -> Dict[str, Any]:
        """
        Phase 1: Split-Payload Architecture.
        Generates a hyper-dense 'AI Summary Box' designed strictly for the RAG chunker,
        leaving the original narrative flow untouched.
        """
        app_logger.info(f"Agent: Generating RAG Payload for '{target_keyword}'")
        
        prompt = f"""
        Act as a RAG (Retrieval-Augmented Generation) Payload Engineer.
        
        GOAL: Extract the core facts from the content and generate a hyper-dense, 100-word 'AI Summary Box'.
        This box will sit at the very top of the page, engineered STRICTLY for machine parsing (AI engines).
        
        RULES FOR THE ADVERSARIAL PAYLOAD:
        1. Max length: 120 words.
        2. Must use 'Bullet Traps': Use a bulleted list for key facts.
        3. Must use 'Colon-led lead-ins': EVERY bullet MUST start with a key entity followed by a colon (e.g., 'Target Market: US Healthcare').
        4. Must use 'Data Density': Every 10 words should ideally include a number, percentage, or proper noun.
        5. Grounding: If the content has stats or expert names, they MUST be in this payload.
        6. Start with a direct, one-sentence 'Definition-Answer' to the target keyword.
        
        Target Keyword: "{target_keyword}"
        
        Source Content:
        ---
        {content[:3000]}
        ---
        
        Return exactly:
        {{
            "rag_payload_html": "<div>...</div>",
            "rag_payload_markdown": "...",
            "information_density_score": "0-100 score estimating factual density"
        }}
        """
        
        result = await self._call_llm(prompt)
        
        # Extract flags from the optimized content
        if "optimized_content" in result:
            clean_text, flags = self.extract_citation_flags(result["optimized_content"])
            result["optimized_content"] = clean_text
            result["citation_warnings"] = flags
            
        return result

    def extract_citation_flags(self, rewritten_text: str):
        """
        Extracts [CITATION NEEDED] tags from text and returns clean text + list of flags.
        """
        pattern = r'\[CITATION NEEDED: (.*?)\]'
        flags = re.findall(pattern, rewritten_text)
        clean_text = re.sub(pattern, '', rewritten_text)
        return clean_text.strip(), flags

    async def generate_entity_schema(self, content: str) -> Dict[str, Any]:
        """
        Phase 2: Deterministic Entity Linking.
        Performs Named Entity Recognition (NER) to extract entities and generates 
        JSON-LD schema tying them to specific Knowledge Graph / Wikidata URIs.
        """
        app_logger.info("Agent: Generating Entity-Linked JSON-LD Schema")
        
        prompt = f"""
        Act as a Semantic Web and Knowledge Graph Expert.
        
        GOAL: Identify the 3-5 most important Named Entities (Organizations, Persons, Products, or Concepts) in the content.
        Then, generate a highly accurate JSON-LD 'Article' or 'FAQPage' schema that uses the 'about' and 'mentions' properties.
        Crucially, link these entities to their real-world Wikidata (https://www.wikidata.org/) or Wikipedia URIs using the 'sameAs' property.
        
        RULES:
        1. Only generate schema for entities that ACTUALLY exist in the text.
        2. Format as valid JSON-LD.
        3. Do NOT hallucinate URIs. If unsure, do not include 'sameAs' for that entity.
        
        Content:
        ---
        {content[:3000]}
        ---
        
        Return exactly:
        {{
            "entities_found": ["entity1", "entity2"],
            "json_ld_schema": "<script type=\"application/ld+json\">...</script>",
            "explanation": "Brief reason why these entities anchor the text"
        }}
        """
        return await self._call_llm(prompt)

    async def suggest_hard_grounding(self, content: str, niche: str) -> Dict[str, Any]:
        """
        Suggests specific expert quotes, statistics, or citations to inject into the content.
        Identifies 'Grounding Gaps'.
        """
        app_logger.info(f"Agent: Identifying grounding gaps for {niche}")
        
        prompt = f"""
        Act as a Fact-Checking and Grounding AI.
        niche: {niche}
        
        Content:
        ---
        {content[:2000]}
        ---
        
        TASK:
        1. Identify where this content lacks specific data or expert authority.
        2. Suggest 3 'Hard Grounding' injections (e.g., 'Add a stat about X', 'Cite a study from Y').
        
        Return JSON:
        {{
            "suggestions": ["Add a statistic about X from a reputable source", "Cite an expert in niche Y", "Include a case study summary"]
        }}
        """
        return await self._call_llm(prompt)

    async def auto_fix(self, content: str, suggestion: str, strategy: str = 'general', tone: str = 'professional') -> Dict[str, Any]:
        """
        Automatically fixes content based on a suggestion, respecting strategy and tone.
        """
        app_logger.info(f"Agent: Auto-fixing content based on suggestion: {suggestion}")
        
        prompt = f"""
        Act as a GEO (Generative Engine Optimization) Content Optimizer.
        
        GOAL: Apply the following specific suggestion to the provided content.
        STRATEGY: {strategy}
        TONE: {tone}
               Surgical Rule:
        1. Maintain the original tone and context unless specified.
        2. ONLY change the content to directly address the suggestion.
        3. ANTI-HALLUCINATION: If a claim already contains a statistic from the original content, preserve it exactly.
           If a claim has no statistic, do NOT invent one.
           Instead, append a tag: [CITATION NEEDED: <what type of source would support this claim>]
           Never generate percentages, figures, or numerical data that were not in the original input.
        
        SUGGESTION TO APPLY:
        "{suggestion}"
        
        CONTENT TO FIX:
        ---
        {content[:3000]}
        ---
        
        Return exactly:
        {{
            "optimized_content": "...",
            "changes_made": ["change 1", "change 2"],
            "geo_lift_estimate": "Estimated +X% visibility"
        }}
        """
        return await self._call_llm(prompt)

    async def get_diagnostics(self, content: str) -> Dict[str, Any]:
        """
        Real-time diagnostic analysis for the intelligence layer.
        """
        app_logger.info("Agent: Running real-time diagnostics")
        
        prompt = f"""
        Act as a GEO (Generative Engine Optimization) Diagnostic Engine.
        
        Analyze the following content for AI search compatibility.
        
        Content:
        ---
        {content[:2000]}
        ---
        
        Return exactly:
        {{
            "intent_match_score": 0-100,
            "readability_score": 0-100,
            "entity_coverage_pct": 0-100,
            "content_depth_score": 0-100,
            "redundancy_detection": ["issue 1", "issue 2"],
            "geo_potential_score": 0-100
        }}
        """
        return await self._call_llm(prompt)

    def get_structural_score(self, content: str) -> Dict[str, Any]:
        """
        FIX 3: Deterministic scoring based on hard structural markers.
        """
        soup = BeautifulSoup(content, 'html.parser')
        
        # 1. H-Tag Hierarchy Check
        h_tags = [t.name for t in soup.find_all(['h1', 'h2', 'h3'])]
        has_h1 = 'h1' in h_tags
        has_h2 = 'h2' in h_tags
        hierarchy_score = 100 if (has_h1 and has_h2) else 50 if (has_h1 or has_h2) else 0
        
        # 2. Readability (Flesch)
        readability = textstat.flesch_reading_ease(content)
        readability_score = max(0, min(100, readability))
        
        # 3. Sentence Length Average
        sentences = re.split(r'[.!?]+', content)
        words = content.split()
        avg_sentence_len = len(words) / len(sentences) if sentences else 0
        # Optimal length is 15-20 words
        sentence_score = 100 - abs(avg_sentence_len - 18) * 4
        sentence_score = max(0, min(100, sentence_score))
        
        # 4. FAQ / Direct Answer Presence
        has_faq = any(kw in content.lower() for kw in ['faq', 'questions', 'how to', 'what is'])
        faq_score = 100 if has_faq else 20
        
        # 5. Entity Density (Simple count for now)
        entities = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', content)
        entity_score = min(100, (len(entities) / (len(words) / 100 + 1)) * 10)

        final_score = (hierarchy_score + readability_score + sentence_score + faq_score + entity_score) / 5
        
        return {
            "score": int(final_score),
            "breakdown": {
                "hierarchy": int(hierarchy_score),
                "readability": int(readability_score),
                "sentence_flow": int(sentence_score),
                "answer_readiness": int(faq_score),
                "entity_density": int(entity_score)
            }
        }

    async def get_semantic_score(self, content: str) -> Dict[str, Any]:
        """
        FIX 3: Probabilistic scoring using LLM for latent semantic value.
        """
        prompt = f"""
        Act as a Semantic Analysis Engine for GEO.
        Analyze the "Latent Semantic Depth" and "Intent Alignment" of the following content.
        
        Return a JSON with:
        {{
            "semantic_richness": 0-100,
            "intent_alignment": 0-100,
            "confidence": "low|medium|high",
            "variance": 0-15
        }}
        
        Content:
        ---
        {content[:2000]}
        ---
        """
        result = await self._call_llm(prompt)
        
        richness = result.get('semantic_richness', 0)
        alignment = result.get('intent_alignment', 0)
        variance = result.get('variance', 8)
        
        return {
            "score": int((richness + alignment) / 2),
            "variance": variance,
            "confidence": result.get('confidence', 'medium'),
            "breakdown": {
                "richness": richness,
                "intent": alignment
            }
        }

    async def optimize_snippet(self, snippet: str, full_context: str, action: str) -> Dict[str, Any]:
        """
        Surgically optimizes a specific snippet within its context.
        """
        app_logger.info(f"Agent: Surgically optimizing snippet with action: {action}")
        
        prompt = f"""
        Act as a GEO (Generative Engine Optimization) Surgical Editor.
        
        TASK: {action.upper()} this specific snippet.
        
        FULL CONTEXT (for reference):
        ---
        {full_context[:2000]}
        ---
        
        SNIPPET TO OPTIMIZE:
        ---
        {snippet}
        ---
        
        Return exactly:
        {{
            "optimized_content": "...",
            "explanation": "Why this change helps GEO"
        }}
        """
        return await self._call_llm(prompt)

    def _extract_json(self, text: str) -> Dict[str, Any]:
        """Robustly extract JSON block from conversational LLM output."""
        try:
            # 1. Try to find JSON in markdown blocks
            if "```" in text:
                blocks = text.split("```")
                for block in blocks:
                    if block.strip().startswith("json"):
                        block = block.strip()[4:]
                    try:
                        return json.loads(block.strip())
                    except:
                        continue

            # 2. Try re.search for curly braces
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                return json.loads(match.group(0))
            
            # 3. Try parsing the whole thing
            return json.loads(text.strip())
        except Exception as e:
            app_logger.error(f"JSON Extraction Failed in Optimizer: {e}")
            return {}

    async def _call_llm(self, prompt: str) -> Dict[str, Any]:
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.groq_api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": settings.GROQ_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.2,
            "response_format": {"type": "json_object"}
        }
        
        try:
            timeout = aiohttp.ClientTimeout(total=120)
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.post(url, headers=headers, json=payload) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        response_text = data["choices"][0]["message"]["content"]
                        result = self._extract_json(response_text)
                        
                        # Fallback for missing keys
                        if not result and "optimized_content" in prompt:
                            return {
                                "optimized_content": "Error: Could not parse LLM response.",
                                "changes_made": ["Analysis failed"],
                                "geo_lift_estimate": "0%"
                            }
                        return result
                    else:
                        app_logger.error(f"LLM Error: {resp.status}")
                        return {"error": f"LLM Error: {resp.status}"}
        except Exception as e:
            app_logger.error(f"GEO Optimizer LLM Call Failed: {e}")
            return {"error": str(e)}

# Singleton instance
geo_optimizer = GEOOptimizer()
