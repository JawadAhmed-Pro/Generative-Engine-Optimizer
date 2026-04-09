import aiohttp
import json
from typing import Dict, Any, List
from config import settings
from logger import app_logger

class GEOOptimizer:
    """The 'Action Layer' - AI Agent that rewrites content for GEO optimization."""
    
    def __init__(self):
        self.groq_api_key = settings.GROQ_API_KEY
        self.gemini_api_key = settings.GEMINI_API_KEY

    async def rewrite_to_inverted_pyramid(self, content: str, query: str = "") -> Dict[str, Any]:
        """
        Rewrites the introduction/answer section to follow the Inverted Pyramid structure.
        Ensures a direct, concise answer (75-120 words) occurs early.
        """
        app_logger.info("Agent: Rewriting content to Inverted Pyramid structure")
        
        prompt = f"""
        Act as a GEO (Generative Engine Optimization) Content Optimizer.
        
        GOAL: Rewrite the following content to maximize citation probability in AI search (Perplexity/ChatGPT).
        
        RULES:
        1. Use the 'Inverted Pyramid': Put the most important answer in the first 100 words.
        2. Keep the answer between 75-120 words for optimal RAG chunk extraction.
        3. Use objective, grounding-heavy language.
        4. Maintain the original meaning but remove 'narrative fluff' or slow build-ups.
        
        Original Query (if any): "{query}"
        
        Content to Rewrite:
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
            "suggestions": [
        }}
        """
        return await self._call_llm(prompt)

    async def auto_fix(self, content: str, suggestion: str) -> Dict[str, Any]:
        """
        Automatically fixes a specific paragraph or text block based on a provided suggestion.
        """
        app_logger.info(f"Agent: Auto-fixing content based on suggestion: {suggestion}")
        
        prompt = f"""
        Act as a GEO (Generative Engine Optimization) Content Optimizer.
        
        GOAL: Apply the following specific suggestion to the provided content to maximize its AI citation probability.
        
        RULE:
        1. Maintain the original tone and context.
        2. ONLY change the content to directly address the suggestion. Do not rewrite everything if it is not needed.
        3. If the suggestion asks for an expert quote or statistic, simulate a hyper-realistic placeholder (e.g. "[Insert Statistic from [Source]]" or create a highly plausible but clearly marked placeholder).
        
        SUGGESTION TO APPLY:
        "{suggestion}"
        
        CONTENT TO FIX:
        ---
        {content[:3000]}
        ---
        
        Return exactly:
        {{
            "optimized_content": "...",
            "changes_made": ["change 1", "change 2"]
        }}
        """
        return await self._call_llm(prompt)

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
                        return json.loads(data["choices"][0]["message"]["content"])
                    else:
                        return {"error": f"LLM Error: {resp.status}"}
        except Exception as e:
            app_logger.error(f"GEO Optimizer LLM Call Failed: {e}")
            return {"error": str(e)}

# Singleton instance
geo_optimizer = GEOOptimizer()
