import aiohttp
import asyncio
import re
from typing import List
from logger import app_logger

class SearchService:
    """Service to handle web searches via Jina Search."""
    
    def __init__(self):
        self.jina_url = "https://s.jina.ai/"

    async def get_top_competitors(self, keyword: str, limit: int = 5) -> List[str]:
        """Fetch top competitor URLs for a keyword via Jina Search."""
        app_logger.info(f"Discovering competitors via Jina Search for: '{keyword}'")
        try:
            headers = {'Accept': 'application/json'}
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.jina_url}{keyword}", headers=headers, timeout=15) as response:
                    if response.status == 200:
                        data = await response.json()
                        results = data.get('data', [])
                        urls = [item.get('url') for item in results if item.get('url')]
                        return urls[:limit]
        except Exception as e:
            app_logger.error(f"Jina competitor search failed: {e}")
        return []

    async def search_and_ground(self, query: str) -> str:
        """
        Perform a multi-query search to fetch high-density grounding data.
        Fetches basic info, benchmarks, and latest industry statistics.
        """
        app_logger.info(f"Fetching multi-query grounding data for: '{query}'")
        
        # Define targeted sub-queries for higher data density
        sub_queries = [
            query,
            f"{query} latest industry statistics 2024 2025",
            f"{query} technical benchmarks and performance data",
            f"{query} expert recommendations and best practices"
        ]
        
        tasks = []
        for q in sub_queries:
            tasks.append(self._fetch_single_query(q))
            
        results = await asyncio.gather(*tasks)
        
        # Combine and deduplicate roughly by taking chunks from each
        combined_context = ""
        for i, res in enumerate(results):
            if res:
                label = ["GENERAL", "STATS", "BENCHMARKS", "EXPERT"][i]
                combined_context += f"\n--- {label} DATA ---\n{res[:1500]}\n"
        
        return combined_context[:6000] # Increased limit for multi-query density

    async def _fetch_single_query(self, query: str) -> str:
        """Internal helper to fetch a single query from Jina."""
        try:
            headers = {'Accept': 'text/plain'}
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.jina_url}{query}", headers=headers, timeout=12) as response:
                    if response.status == 200:
                        return await response.text()
        except Exception as e:
            app_logger.error(f"Jina sub-query failed ('{query}'): {e}")
        return ""

# Singleton instance
search_service = SearchService()
