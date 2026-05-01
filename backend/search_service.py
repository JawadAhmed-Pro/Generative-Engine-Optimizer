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
        Use Jina Search to discover high-authority competitors for a keyword.
        """
        app_logger.info(f"Discovering competitors for: '{keyword}' via Jina Search")
        
        try:
            # We use a formatted query to find top ranking pages
            query = f"top results for {keyword}"
            url = f"{self.jina_url}{query}"
            
            # Using aiohttp for non-blocking search
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=20) as resp:
                    if resp.status == 200:
                        text = await resp.text()
                        return self._extract_urls(text, limit)
                    else:
                        app_logger.error(f"Jina Search Failed: HTTP {resp.status}")
                        return []
        except Exception as e:
            app_logger.error(f"Search discovery failed: {e}")
            return []

    def _extract_urls(self, text: str, limit: int) -> List[str]:
        """Extract URLs from Jina's markdown output using regex."""
        # Jina often returns [Title](URL)
        urls = re.findall(r'\[.*?\]\((https?://.*?)\)', text)
        
        # Clean and filter URLs (avoiding Jina's own links if any)
        clean_urls = []
        seen = set()
        
        # Common noise domains to ignore
        ignore_list = ['jina.ai', 'google.com', 'facebook.com', 'twitter.com', 'linkedin.com', 'youtube.com']
        
        for url in urls:
            # Basic validation
            if any(ignore in url for ignore in ignore_list):
                continue
            
            # Remove tracking params if any
            clean_url = url.split('?')[0].rstrip('/')
            
            if clean_url not in seen:
                clean_urls.append(clean_url)
                seen.add(clean_url)
            
            if len(clean_urls) >= limit:
                break
                
        return clean_urls

    async def search_and_ground(self, query: str) -> str:
        """Perform a search and return a condensed text block for grounding."""
        try:
            url = f"{self.jina_url}{query}"
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=20) as resp:
                    if resp.status == 200:
                        text = await resp.text()
                        # Return top 3000 chars for context
                        return text[:3000]
            return ""
        except:
            return ""

# Singleton instance
search_service = SearchService()
