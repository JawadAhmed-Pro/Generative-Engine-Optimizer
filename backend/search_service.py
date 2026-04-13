from duckduckgo_search import DDGS
from logger import app_logger
from typing import List

class SearchService:
    """Service to handle live web searches for Competitor Analysis."""
    
    def __init__(self):
        self.ddgs = DDGS()

    def get_top_competitors(self, keyword: str, limit: int = 3) -> List[str]:
        """
        Search for the top competitor URLs based on a keyword.
        
        Args:
            keyword: The search query intended to find competitors.
            limit: Number of top results to return.
            
        Returns:
            List of URLs.
        """
        urls = []
        try:
            app_logger.info(f"Performing live search for keyword: '{keyword}' with limit {limit}")
            # Perform text search
            results = self.ddgs.text(keyword, max_results=limit)
            for res in results:
                url = res.get('href')
                if url:
                    urls.append(url)
            app_logger.info(f"Found {len(urls)} competitors for keyword '{keyword}'")
        except Exception as e:
            app_logger.error(f"Search Service Error for keyword '{keyword}': {str(e)}")
            
        return urls
