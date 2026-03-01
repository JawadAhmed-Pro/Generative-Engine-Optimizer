"""
Citation Tracker Module
Queries multiple AI platforms with test prompts and checks if a domain/URL gets cited.
Tracks citation frequency over time.
"""
import asyncio
import aiohttp
import json
import re
from datetime import datetime
from typing import Dict, List, Any, Optional
from config import settings
from google import genai


class CitationTracker:
    """Track brand/domain citations across AI platforms."""

    PLATFORMS = {
        "groq": {
            "name": "Groq (Llama 3)",
            "icon": "🚀",
            "color": "#F05D23"
        },
        "gemini": {
            "name": "Google Gemini",
            "icon": "✨",
            "color": "#4285F4"
        }
    }

    def __init__(self):
        self.groq_api_key = settings.GROQ_API_KEY
        if settings.GEMINI_API_KEY:
            self.gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)
        else:
            self.gemini_client = None

    async def track_citations(
        self,
        domain: str,
        prompts: List[str],
        brand_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Query multiple AI platforms with prompts and check for domain citations.

        Args:
            domain: The domain to track (e.g., 'example.com')
            prompts: List of test prompts to query
            brand_name: Optional brand name to search for mentions

        Returns:
            Citation results per platform with metrics
        """
        results = {
            "domain": domain,
            "brand_name": brand_name or domain,
            "tracked_at": datetime.utcnow().isoformat(),
            "prompts_tested": len(prompts),
            "platforms": {},
            "summary": {}
        }

        # Track across available platforms
        platform_tasks = []

        if self.groq_api_key:
            platform_tasks.append(
                self._track_groq(domain, prompts, brand_name)
            )
        
        if hasattr(self, 'gemini_client') and self.gemini_client:
            platform_tasks.append(
                self._track_gemini(domain, prompts, brand_name)
            )

        # Run all platforms concurrently
        platform_results = await asyncio.gather(*platform_tasks, return_exceptions=True)

        # Collect results
        platform_keys = []
        if self.groq_api_key:
            platform_keys.append("groq")
        if hasattr(self, 'gemini_client') and self.gemini_client:
            platform_keys.append("gemini")

        for i, key in enumerate(platform_keys):
            if i < len(platform_results) and not isinstance(platform_results[i], Exception):
                results["platforms"][key] = platform_results[i]
            else:
                error_msg = str(platform_results[i]) if i < len(platform_results) else "Not available"
                results["platforms"][key] = {
                    "name": self.PLATFORMS[key]["name"],
                    "status": "error",
                    "error": error_msg,
                    "citations": [],
                    "citation_rate": 0,
                    "total_mentions": 0
                }

        # Calculate summary
        total_citations = 0
        total_prompts_across = 0
        platforms_checked = 0

        for platform_data in results["platforms"].values():
            if platform_data.get("status") != "error":
                total_citations += platform_data.get("total_mentions", 0)
                total_prompts_across += len(prompts)
                platforms_checked += 1

        results["summary"] = {
            "total_citations": total_citations,
            "platforms_checked": platforms_checked,
            "overall_citation_rate": round(
                (total_citations / max(total_prompts_across, 1)) * 100, 1
            ),
            "prompts_tested": len(prompts)
        }

        return results

    async def _track_groq(
        self, domain: str, prompts: List[str], brand_name: Optional[str]
    ) -> Dict[str, Any]:
        """Query Groq with prompts and check citations."""
        citations = []
        total_mentions = 0

        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.groq_api_key}",
            "Content-Type": "application/json"
        }

        for prompt in prompts:
            try:
                payload = {
                    "model": settings.GROQ_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3,
                    "max_tokens": 1000
                }

                async with aiohttp.ClientSession() as session:
                    async with session.post(url, headers=headers, json=payload) as response:
                        if response.status == 200:
                            data = await response.json()
                            ai_response = data["choices"][0]["message"]["content"]

                            # Check for domain/brand mentions
                            mention_result = self._check_mentions(
                                ai_response, domain, brand_name
                            )

                            citations.append({
                                "prompt": prompt,
                                "cited": mention_result["cited"],
                                "mention_count": mention_result["count"],
                                "context": mention_result["context"],
                                "response_snippet": ai_response[:300] + "..." if len(ai_response) > 300 else ai_response,
                                "sentiment": mention_result.get("sentiment", "neutral")
                            })

                            if mention_result["cited"]:
                                total_mentions += 1
                        else:
                            citations.append({
                                "prompt": prompt,
                                "cited": False,
                                "error": f"API returned {response.status}"
                            })

                # Rate limiting - wait between requests
                await asyncio.sleep(1)

            except Exception as e:
                citations.append({
                    "prompt": prompt,
                    "cited": False,
                    "error": str(e)
                })

        return {
            "name": "Groq (Llama 3)",
            "status": "success",
            "citations": citations,
            "citation_rate": round((total_mentions / max(len(prompts), 1)) * 100, 1),
            "total_mentions": total_mentions,
            "total_prompts": len(prompts)
        }

    async def _track_gemini(
        self, domain: str, prompts: List[str], brand_name: Optional[str]
    ) -> Dict[str, Any]:
        """Query Gemini with prompts and check citations."""
        citations = []
        total_mentions = 0

        for prompt in prompts:
            try:
                response = await self.gemini_client.aio.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=prompt
                )
                ai_response = response.text

                mention_result = self._check_mentions(ai_response, domain, brand_name)

                citations.append({
                    "prompt": prompt,
                    "cited": mention_result["cited"],
                    "mention_count": mention_result["count"],
                    "context": mention_result["context"],
                    "response_snippet": ai_response[:300] + "..." if len(ai_response) > 300 else ai_response,
                    "sentiment": mention_result.get("sentiment", "neutral")
                })

                if mention_result["cited"]:
                    total_mentions += 1

                # Rate limiting
                await asyncio.sleep(1)

            except Exception as e:
                citations.append({
                    "prompt": prompt,
                    "cited": False,
                    "error": str(e)
                })

        return {
            "name": "Google Gemini",
            "status": "success",
            "citations": citations,
            "citation_rate": round((total_mentions / max(len(prompts), 1)) * 100, 1),
            "total_mentions": total_mentions,
            "total_prompts": len(prompts)
        }

    def _check_mentions(
        self, response: str, domain: str, brand_name: Optional[str]
    ) -> Dict[str, Any]:
        """Check if a response mentions the domain or brand."""
        response_lower = response.lower()
        domain_lower = domain.lower().replace("www.", "")
        
        # Check for domain mentions
        domain_mentioned = domain_lower in response_lower
        
        # Check for brand name mentions
        brand_mentioned = False
        if brand_name:
            brand_lower = brand_name.lower()
            brand_mentioned = brand_lower in response_lower

        # Check for URL patterns containing the domain
        url_pattern = re.findall(
            rf'https?://[^\s]*{re.escape(domain_lower)}[^\s]*',
            response_lower
        )

        cited = domain_mentioned or brand_mentioned or len(url_pattern) > 0
        count = 0
        contexts = []

        if domain_mentioned:
            count += response_lower.count(domain_lower)
            # Extract context around mention
            for match in re.finditer(re.escape(domain_lower), response_lower):
                start = max(0, match.start() - 50)
                end = min(len(response), match.end() + 50)
                contexts.append(response[start:end].strip())

        if brand_mentioned and brand_name:
            brand_lower = brand_name.lower()
            count += response_lower.count(brand_lower)
            for match in re.finditer(re.escape(brand_lower), response_lower):
                start = max(0, match.start() - 50)
                end = min(len(response), match.end() + 50)
                ctx = response[start:end].strip()
                if ctx not in contexts:
                    contexts.append(ctx)

        count += len(url_pattern)

        # Simple sentiment detection
        sentiment = "neutral"
        if cited and contexts:
            positive_words = ["best", "excellent", "great", "top", "recommended", "leading", "popular", "trusted"]
            negative_words = ["worst", "avoid", "poor", "bad", "issues", "problems", "complaints"]
            
            context_text = " ".join(contexts).lower()
            pos_count = sum(1 for w in positive_words if w in context_text)
            neg_count = sum(1 for w in negative_words if w in context_text)
            
            if pos_count > neg_count:
                sentiment = "positive"
            elif neg_count > pos_count:
                sentiment = "negative"

        return {
            "cited": cited,
            "count": count,
            "context": contexts[:3],  # Top 3 contexts
            "urls_found": url_pattern[:3],
            "sentiment": sentiment
        }

    def generate_test_prompts(self, domain: str, niche: str, brand_name: Optional[str] = None) -> List[str]:
        """Generate relevant test prompts for a domain/niche."""
        name = brand_name or domain
        
        prompts = [
            f"What are the best {niche} tools in 2026?",
            f"Compare top {niche} platforms available today",
            f"What is {name} and what does it do?",
            f"Best alternatives to popular {niche} services",
            f"Top rated {niche} solutions for small businesses",
            f"What tools do experts recommend for {niche}?",
            f"Which {niche} platform has the best reviews?",
            f"Best free {niche} tools available online",
            f"How to choose the right {niche} tool?",
            f"What are the pros and cons of different {niche} platforms?",
        ]
        
        return prompts
