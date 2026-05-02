import aiohttp
import asyncio
from typing import List, Dict, Any
from config import settings
from google import genai
import json
import re
from logger import app_logger
from search_service import search_service

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
        paa_task = search_service.search_and_ground(f"site:google.com \"People also ask\" {keyword}")
        reddit_task = search_service.search_and_ground(f"site:reddit.com OR site:quora.com {keyword} \"question\"")
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

        # 3. Phase B: Topical Clustering
        clusters = await self._cluster_prompts(prompts) if len(prompts) > 5 else []

        return {
            "keyword": keyword,
            "niche": niche,
            "top_prompts": prompts,
            "clusters": clusters,
            "sourced_from": ["Google PAA", "Reddit", "Quora"]
        }

    async def _scrape_jina_search(self, query: str) -> str:
        """[DEPRECATED] Use search_service.search_and_ground instead."""
        return await search_service.search_and_ground(query)
             
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
        - search_volume_estimate: "high", "medium", or "low"
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
        - prompt, source_signal, intent, value_score, search_volume_estimate ("high"/"medium"/"low"), content_gap
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
        """Phase C Improvement: Robust AI Search Citation Simulation with attribution feedback."""
        app_logger.info(f"Simulating AI search citation for {len(prompts)} prompts...")
        
        # Test a larger sample of 15 prompts for statistical significance
        test_prompts = prompts[:15]
        
        async def _run_single_sim(p: str):
            check_prompt = f"""
            AI SEARCH SIMULATION:
            Query: "{p}"
            Candidate Content Sample:
            ---
            {content[:2500]}
            ---
            TASK: 
            1. Would you cite this content? (true/false)
            2. If false, what SPECIFICALLY is missing? (e.g., 'missing price comparison', 'lacks expert quote')
            3. Confidence (1-100)
            
            Return JSON: {{"cited": true/false, "attribution_feedback": "...", "confidence": 0-100}}
            """
            
            # Using Gemini for simulation due to better citation reasoning
            if self.gemini_client:
                try:
                    from google.genai import types
                    config = types.GenerateContentConfig(temperature=0.1, response_mime_type="application/json")
                    response = await self.gemini_client.aio.models.generate_content(
                        model=settings.GEMINI_MODEL,
                        contents=check_prompt,
                        config=config
                    )
                    sim = self._extract_json(response.text)
                    if sim:
                        sim['prompt'] = p
                        return sim
                except Exception: pass
            return None

        # Run simulations in parallel
        tasks = [_run_single_sim(p) for p in test_prompts]
        simulation_results = await asyncio.gather(*tasks)
        simulation_results = [s for s in simulation_results if s is not None]

        return {
            "simulation_runs": simulation_results,
            "overall_citation_rate": sum(1 for s in simulation_results if s.get('cited')) / len(simulation_results) if simulation_results else 0,
            "sample_size": len(simulation_results)
        }

    async def _cluster_prompts(self, prompts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Phase B Improvement: Cluster prompts into thematic silos for strategic planning.
        """
        if not self.gemini_client and not self.groq_api_key:
            return []
            
        p_list = [p['prompt'] for p in prompts]
        
        prompt = f"""
        Act as a GEO Strategist.
        Group the following AI Prompts into 3-5 logical "Topical Clusters" (Silos).
        
        PROMPTS:
        {json.dumps(p_list)}
        
        TASK:
        1. Identify the primary themes.
        2. Assign each prompt to a cluster.
        3. For each cluster, provide:
           - name: A short thematic name (e.g., "Technical Specifications")
           - description: 1 sentence on why this cluster is important for GEO.
           - prompts: List of prompt strings belonging to this cluster.
        
        Return exactly and ONLY a JSON array of objects.
        """
        
        try:
            # Using Gemini for better categorization logic
            if self.gemini_client:
                from google.genai import types
                config = types.GenerateContentConfig(
                    temperature=0.1,
                    response_mime_type="application/json"
                )
                response = await self.gemini_client.aio.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=prompt,
                    config=config
                )
                result = self._extract_json(response.text)
                if result: return result
            
            # Fallback to Groq
            if self.groq_api_key:
                url = "https://api.groq.com/openai/v1/chat/completions"
                headers = {"Authorization": f"Bearer {self.groq_api_key}", "Content-Type": "application/json"}
                payload = {
                    "model": settings.GROQ_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.1,
                    "response_format": {"type": "json_object"}
                }
                async with aiohttp.ClientSession() as session:
                    async with session.post(url, headers=headers, json=payload) as resp:
                        if resp.status == 200:
                            data = await resp.json()
                            return self._extract_json(data["choices"][0]["message"]["content"])
        except Exception as e:
            app_logger.error(f"Clustering Failed: {e}")
            
        return []

    def _fallback_prompts(self, keyword: str, niche: str) -> List[Dict[str, Any]]:
        return [
            {
                "prompt": f"What is the best {keyword} for {niche}?",
                "intent": "commercial",
                "value_score": 85,
                "search_volume_estimate": "high",
                "source_signal": "Synthesized",
                "content_gap": "Usually lacks direct feature comparisons."
            },
            {
                "prompt": f"How to use {keyword} effectively?",
                "intent": "informational",
                "value_score": 70,
                "search_volume_estimate": "medium",
                "source_signal": "Synthesized",
                "content_gap": "Most answers are too academic and lack practical examples."
            },
            {
                "prompt": f"Is {keyword} worth it in 2026?",
                "intent": "commercial",
                "value_score": 80,
                "search_volume_estimate": "high",
                "source_signal": "Synthesized",
                "content_gap": "Content is often outdated and doesn't factor in recent AI updates."
            }
        ]
