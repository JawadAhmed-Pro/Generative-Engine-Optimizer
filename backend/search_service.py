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
        """Perform a search and return a condensed text block for grounding."""
        app_logger.info(f"Fetching live grounding data for: '{query}'")
        try:
            # We fetch text format for direct LLM grounding
            headers = {'Accept': 'text/plain'}
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.jina_url}{query}", headers=headers, timeout=15) as response:
                    if response.status == 200:
                        content = await response.text()
                        # Limit grounding context length to prevent massive token usage
                        return content[:3000] 
        except Exception as e:
            app_logger.error(f"Jina grounding search failed: {e}")
        return ""

# Singleton instance
search_service = SearchService()
