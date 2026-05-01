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
        """
        [DISABLED] Jina Search discovery.
        """
        app_logger.info(f"Skipping competitor discovery for: '{keyword}' (Jina Search Disabled)")
        return []

    async def search_and_ground(self, query: str) -> str:
        """[DISABLED] Perform a search and return a condensed text block for grounding."""
        app_logger.info(f"Skipping search grounding for: '{query}' (Jina Search Disabled)")
        return ""

# Singleton instance
search_service = SearchService()
