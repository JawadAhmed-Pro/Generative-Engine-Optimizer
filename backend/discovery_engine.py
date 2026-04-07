import aiohttp
import asyncio
from typing import List, Dict, Any
from config import settings
from google import genai
import json
from logger import app_logger

class PromptDiscoveryEngine:
    """Discovers 'People Also Ask' and niche queries using LLM / Search."""
    
    def __init__(self):
        if settings.GEMINI_API_KEY:
            self.gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)
        else:
            self.gemini_client = None
            
        self.groq_api_key = settings.GROQ_API_KEY

    async def discover_prompts(self, keyword: str, niche: str) -> List[Dict[str, Any]]:
        """
        Discover high-value prompts / questions for a given keyword/niche.
        Uses Groq (fast inference) or Gemini as fallback to 
        simulate 'People Also Ask' and real-world AI queries.
        """
        if self.groq_api_key:
             return await self._discover_via_groq(keyword, niche)
        elif self.gemini_client:
             return await self._discover_via_gemini(keyword, niche)
        else:
             return self._fallback_prompts(keyword, niche)
             
    async def _discover_via_groq(self, keyword: str, niche: str) -> List[Dict[str, Any]]:
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.groq_api_key}",
            "Content-Type": "application/json"
        }
        
        prompt = f"""
        Act as an SEO and AI-Search intent expert.
        I need to create Content Strategy for the keyword: "{keyword}" in the "{niche}" niche.
        Identify 5-7 high-value "People Also Ask" questions or common prompts that users type into AI tools (like ChatGPT) regarding this topic.
        
        For each prompt, provide:
        - prompt: The actual question/query
        - intent: "informational", "commercial", or "navigational"
        - search_volume_estimate: "high", "medium", or "low"
        - content_gap: Why existing content fails to answer this well (1 sentence)
        
        Return exactly and ONLY a JSON array of objects. Do not include markdown formatting like ```json.
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
                        content = data["choices"][0]["message"]["content"].strip()
                        # Clean if it wrapped in markdown
                        if content.startswith('```json'):
                            content = content[7:-3].strip()
                        elif content.startswith('```'):
                            content = content[3:-3].strip()
                            
                        return json.loads(content)
                    else:
                        app_logger.error(f"Groq Discovery Error: {response.status}")
                        return self._fallback_prompts(keyword, niche)
        except Exception as e:
            app_logger.error(f"Prompt Discovery Failed: {e}")
            return self._fallback_prompts(keyword, niche)

    async def _discover_via_gemini(self, keyword: str, niche: str) -> List[Dict[str, Any]]:
        prompt = f"""
        Act as an SEO and AI-Search intent expert.
        I need to create Content Strategy for the keyword: "{keyword}" in the "{niche}" niche.
        Identify 5-7 high-value "People Also Ask" questions or common prompts that users type into AI tools regarding this topic.
        
        For each prompt, provide:
        - prompt: The actual question/query
        - intent: "informational", "commercial", or "navigational"
        - search_volume_estimate: "high", "medium", or "low"
        - content_gap: Why existing content fails to answer this well (1 sentence)
        
        Return exactly and ONLY a JSON array of objects. Do not wrap it in markdown blockquotes.
        """
        
        try:
            response = await self.gemini_client.aio.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt
            )
            content = response.text.strip()
            
            # Clean if it wrapped in markdown
            if '```json' in content:
                content = content.split('```json')[1].split('```')[0].strip()
            elif '```' in content:
                content = content.split('```')[1].split('```')[0].strip()
                
            return json.loads(content)
        except Exception as e:
            app_logger.error(f"Gemini Discovery Failed: {e}")
            return self._fallback_prompts(keyword, niche)
            
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
