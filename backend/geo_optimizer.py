import aiohttp
import json
import re
from typing import Dict, Any, List
from config import settings
from logger import app_logger

class GEOOptimizer:
    """The 'Action Layer' - AI Agent that rewrites content for GEO optimization."""
    
    def __init__(self):
        self.groq_api_key = settings.GROQ_API_KEY
        self.gemini_api_key = settings.GEMINI_API_KEY

    async def rewrite(self, content: str, strategy: str = 'general', tone: str = 'professional', audience: str = 'intermediate', strength: int = 50) -> Dict[str, Any]:
        """
        Advanced strategy-based rewrite.
        """
        app_logger.info(f"Agent: Rewriting content using strategy: {strategy}")
        
        strength_desc = "Lightly polish" if strength < 30 else "Moderately optimize" if strength < 70 else "Aggressively rewrite"
        
        strategy_prompts = {
            "authority_boost": "Focus on adding expert authority, citations, and data-driven grounding. Use authoritative terminology.",
            "ai_answer_mode": "Force an Inverted Pyramid structure. Ensure a bolded, direct answer appears in the first 75 words.",
            "semantic_expansion": "Identify missing sub-topics and semantic entities. Expand the content to cover these gaps.",
            "concise": "Remove all fluff and redundant phrases. Focus on extreme information density.",
            "technical": "Increase technical depth and use domain-specific jargon suitable for an expert audience."
        }
        
        strategy_instruction = strategy_prompts.get(strategy, "Optimize for AI search visibility and citation probability.")
        
        prompt = f"""
        Act as a GEO (Generative Engine Optimization) Content Optimizer.
        
        STRATEGY: {strategy.upper()}
        INSTRUCTION: {strategy_instruction}
        TONE: {tone}
        AUDIENCE: {audience}
        INTENSITY: {strength_desc} ({strength}/100)
        
        TASK:
        1. Rewrite the following content to align with the chosen strategy and tone.
        2. Maintain the core meaning but significantly improve the "GEO potential".
        3. Use {strength_desc} approach - do not deviate more than necessary from the source unless high intensity is requested.
        
        Content to Rewrite:
        ---
        {content[:4000]}
        ---
        
        Return exactly:
        {{
            "optimized_content": "...",
            "changes_made": ["change 1", "change 2"],
            "geo_lift_estimate": "Estimated +X% visibility"
        }}
        """
        
        return await self._call_llm(prompt)

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
        
        return await self._call_llm(prompt)


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
            "json_ld_schema": "<script type=\\"application/ld+json\\">...</script>",
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
        {
            "suggestions": ["Add a statistic about X from a reputable source", "Cite an expert in niche Y", "Include a case study summary"]
        }
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
        3. If requesting an expert quote or statistic, simulate a high-fidelity placeholder (e.g. "[Insert Specific Performance Data from [Source]]").
        
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
            async with aiohttp.ClientSession() as session:
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
