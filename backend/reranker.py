"""
Lightweight pass-through for RAG retrieval quality.
(Local Cross-encoder reranking was removed to solve Render 512MB RAM OOM crash.
Gemini embeddings are high quality enough to skip the secondary pass.)
"""
from typing import List, Dict, Any, Tuple
from logger import app_logger

# Lazy loading to avoid slow startup
_reranker = None


def get_reranker():
    """Dummy function to maintain signature."""
    return None


def rerank_results(
    query: str,
    documents: List[Dict[str, Any]],
    top_k: int = 5
) -> List[Dict[str, Any]]:
    """
    Dummy pass-through that returns documents unaltered.
    Provides API compatibility without the 500MB PyTorch RAM cost.
    """
    if not documents:
        return []
    
    # Just return top_k documents
    return documents[:top_k]


def rerank_with_scores(
    query: str,
    documents: List[str],
    top_k: int = 5
) -> List[Tuple[str, float]]:
    """
    Dummy pass-through that assigns a baseline score of 0.8
    to maintain downstream compatibility.
    """
    if not documents:
        return []
    
    return [(doc, 0.8) for doc in documents[:top_k]]

