from logger import app_logger
from typing import List

class SearchService:
    """Service to handle web searches (Placeholder/Disabled)."""
    
    def __init__(self):
        # External Search APIs disabled per request. 
        # Integration deferred to a later decision.
        pass

    def get_top_competitors(self, keyword: str, limit: int = 3) -> List[str]:
        """
        Placeholder for competitor discovery. Currently returns empty to comply with API restrictions.
        """
        app_logger.info(f"Live search for keyword: '{keyword}' is currently DISABLED.")
        return []
