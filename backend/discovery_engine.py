import aiohttp
import asyncio
from typing import List, Dict, Any
from config import settings
from google import genai
import json
import re
from logger import app_logger

class PromptDiscoveryEngine:
    """Discovers 'People Also Ask' and niche queries using LLM / Search."""
    
    def __init__(self):
        if settings.GEMINI_API_KEY:
            self.gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)
        else:
            self.gemini_client = None
            
        self.groq_api_key = settings.GROQ_API_KEY

    def _extract_json(self, text: str) -> Any:
        """Robustly extract JSON block from conversational LLM output."""
        # Find the first [ or { and the last ] or }
        match = re.search(r'(\[|\{).*(\]|\})', text, re.DOTALL)
        if match:
            try:
                json_str = match.group(0)
                return json.loads(json_str)
            except json.JSONDecodeError:
                app_logger.error(f"JSON Parse Error in Discovery: {text[:200]}")
        return None

    async def discover_prompts(self, keyword: str, niche: str) -> Dict[str, Any]:
        """
        Discover high-value prompts / questions for a given keyword/niche.
        Grounds the discovery in real-world data from Google PAA and Reddit/Quora.
        """
        app_logger.info(f"Starting real-world prompt discovery for: {keyword}")
        
        # 1. Scrape Real Data (Grounded Signals) - Run in parallel to save time
        paa_task = self._scrape_jina_search(f"site:google.com \"People also ask\" {keyword}")
        reddit_task = self._scrape_jina_search(f"site:reddit.com OR site:quora.com {keyword} \"question\"")
        paa_data, reddit_data = await asyncio.gather(paa_task, reddit_task)
        
        # 2. Synthesize with LLM
        signals = {
            "paa": paa_data[:2000], # Cap for context window
            "social": reddit_data[:2000]
        }
        
        if self.groq_api_key:
             prompts = await self._discover_via_groq(keyword, niche, signals)
        elif self.gemini_client:
             prompts = await self._discover_via_gemini(keyword, niche, signals)
        else:
             prompts = self._fallback_prompts(keyword, niche)

        return {
            "keyword": keyword,
            "niche": niche,
            "top_prompts": prompts,
            "sourced_from": ["Google PAA", "Reddit", "Quora"]
        }

    async def _scrape_jina_search(self, query: str) -> str:
        """Helper to use Jina Search API (s.jina.ai) for grounding."""
        try:
            url = f"https://s.jina.ai/{query}"
            headers = {"Accept": "text/event-stream"} # Get clean markdown
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers, timeout=20) as resp:
                    if resp.status == 200:
                        return await resp.text()
                    return ""
        except Exception as e:
            app_logger.error(f"Jina Search Failed for query {query}: {e}")
            return ""
             
    async def _discover_via_groq(self, keyword: str, niche: str, signals: Dict[str, str]) -> List[Dict[str, Any]]:
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.groq_api_key}",
            "Content-Type": "application/json"
        }
        
        prompt = f"""
        Act as a GEO (Generative Engine Optimization) Analyst.
        Target Keyword: "{keyword}"
        Niche: "{niche}"
        
        GROUNDING DATA (Scraped from Google PAA and Reddit):
        ---
        {signals['paa']}
        ---
        {signals['social']}
        ---

        TASK:
        1. Parse the grounding data for ACTUAL user questions and AI prompts.
        2. Generate a "Top 15" list of high-value prompts that AI Search engines (Perplexity/ChatGPT) are likely to use to extract answers from content.
        
        For each prompt, provide:
        - prompt: The actual query
        - source_signal: "PAA", "Social", or "Synthesized"
        - intent: "informational", "commercial", or "navigational"
        - value_score: 1-100 (Based on how much this prompt drives citation potential)
        - content_gap: Why current content fails (1 sentence)
        
        Return ONLY valid JSON array of objects.
        """
        
        payload = {
            "model": settings.GROQ_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.3
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=headers, json=payload) as response:
                    if response.status == 200:
                        data = await response.json()
                        content = data["choices"][0]["message"]["content"]
                        result = self._extract_json(content)
                        if result is not None:
                            return result
                        return self._fallback_prompts(keyword, niche)
                    else:
                        app_logger.error(f"Groq Discovery Error: {response.status}")
                        return self._fallback_prompts(keyword, niche)
        except Exception as e:
            app_logger.error(f"Prompt Discovery Failed: {e}")
            return self._fallback_prompts(keyword, niche)

    async def _discover_via_gemini(self, keyword: str, niche: str, signals: Dict[str, str]) -> List[Dict[str, Any]]:
        prompt = f"""
        Act as a GEO (Generative Engine Optimization) Analyst.
        Target Keyword: "{keyword}"
        Niche: "{niche}"
        
        GROUNDING DATA (Live Search & Social):
        ---
        {signals['paa']}
        ---
        {signals['social']}
        ---

        TASK:
        1. Extract the most common user questions from the grounding data.
        2. Format them as 15 "AI Prompts" that drive citation volume.
        
        Return exactly and ONLY a JSON array of objects with:
        - prompt, source_signal, intent, value_score, content_gap
        """
        
        try:
            response = await self.gemini_client.aio.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt
            )
            content = response.text
            result = self._extract_json(content)
            if result is not None:
                return result
            return self._fallback_prompts(keyword, niche)
        except Exception as e:
            app_logger.error(f"Gemini Discovery Failed: {e}")
            return self._fallback_prompts(keyword, niche)
            
    async def generate_niche_library(self, niche: str) -> List[Dict[str, Any]]:
        """Builds a comprehensive 'Top 50' prompt library for a specific niche."""
        app_logger.info(f"Generating full Top 50 library for niche: {niche}")
        
        # We run 3 specialized discovery passes to get diversity and volume
        tasks = [
            self.discover_prompts(f"technical {niche} questions", niche),
            self.discover_prompts(f"commercial {niche} buyer intent", niche),
            self.discover_prompts(f"{niche} pros and cons", niche)
        ]
        
        results = await asyncio.gather(*tasks)
        
        all_prompts = []
        for r in results:
            all_prompts.extend(r.get("top_prompts", []))
            
        # Deduplicate and sort by value_score
        unique_prompts = {p['prompt']: p for p in all_prompts}.values()
        sorted_prompts = sorted(unique_prompts, key=lambda x: x.get('value_score', 0), reverse=True)
        
        return list(sorted_prompts)[:50]

    async def simulate_search(self, content: str, prompts: List[str]) -> Dict[str, Any]:
        """Tests content against real prompts to see if AI Search would cite it."""
        app_logger.info(f"Simulating AI search citation for {len(prompts)} prompts")
        
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {"Authorization": f"Bearer {self.groq_api_key}", "Content-Type": "application/json"}
        
        # Test a sample of 5 highly relevant prompts for citation probability
        test_prompts = prompts[:5]
        simulation_results = []
        
        for p in test_prompts:
            check_prompt = f"""
            AI SEARCH SIMULATION:
            Query: "{p}"
            Candidate Content:
            ---
            {content[:1500]}
            ---
            Task: If you were an AI Search engine (Perplexity), would you cite this content to answer the query?
            Return JSON: {{"cited": true/false, "reason": "...", "confidence": 1-100}}
            """
            
            payload = {
                "model": settings.GROQ_MODEL,
                "messages": [{"role": "user", "content": check_prompt}],
                "temperature": 0.1
            }
            
            async with aiohttp.ClientSession() as session:
                 async with session.post(url, headers=headers, json=payload) as resp:
                     if resp.status == 200:
                         data = await resp.json()
                         content = data["choices"][0]["message"]["content"]
                         sim = self._extract_json(content)
                         if sim:
                             sim['prompt'] = p
                             simulation_results.append(sim)

        return {
            "simulation_runs": simulation_results,
            "overall_citation_rate": sum(1 for s in simulation_results if s['cited']) / len(simulation_results) if simulation_results else 0
        }

    def _fallback_prompts(self, keyword: str, niche: str) -> List[Dict[str, Any]]:
        return [
            {
                "prompt": f"What is the best {keyword} for {niche}?",
                "intent": "commercial",
                "search_volume_estimate": "high",
                "content_gap": "Usually lacks direct feature comparisons."
            },
            {
                "prompt": f"How to use {keyword} effectively?",
                "intent": "informational",
                "search_volume_estimate": "medium",
                "content_gap": "Most answers are too academic and lack practical examples."
            },
            {
                "prompt": f"Is {keyword} worth it in 2026?",
                "intent": "commercial",
                "search_volume_estimate": "high",
                "content_gap": "Content is often outdated and doesn't factor in recent AI updates."
            }
        ]
