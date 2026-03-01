"""
Cross-encoder reranking for improved RAG retrieval quality.
Uses the sentence-transformers library with a pre-trained cross-encoder model.
"""
from typing import List, Dict, Any, Tuple
import os
from logger import app_logger

# Lazy loading to avoid slow startup
_reranker = None


def get_reranker():
    """Lazy load the cross-encoder model."""
    global _reranker
    if _reranker is None:
        try:
            from sentence_transformers import CrossEncoder
            app_logger.info("Loading cross-encoder reranker model...")
            # MS MARCO MiniLM is fast and effective for reranking
            _reranker = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')
            app_logger.info("Reranker model loaded successfully")
        except Exception as e:
            app_logger.warning(f"Could not load reranker: {e}")
            _reranker = None
    return _reranker


def rerank_results(
    query: str,
    documents: List[Dict[str, Any]],
    top_k: int = 5
) -> List[Dict[str, Any]]:
    """
    Rerank retrieved documents using a cross-encoder model.
    
    Cross-encoders are more accurate than bi-encoders for ranking
    because they process query and document together.
    
    Args:
        query: The search query
        documents: List of documents with 'content' key
        top_k: Number of top results to return
        
    Returns:
        Reranked documents with added 'rerank_score' field
    """
    if not documents:
        return []
    
    reranker = get_reranker()
    
    # If reranker not available, return original order
    if reranker is None:
        return documents[:top_k]
    
    try:
        # Prepare query-document pairs for cross-encoder
        pairs = [(query, doc.get('content', '')) for doc in documents]
        
        # Score all pairs
        scores = reranker.predict(pairs)
        
        # Add scores to documents and sort
        scored_docs = []
        for i, doc in enumerate(documents):
            doc_copy = doc.copy()
            doc_copy['rerank_score'] = float(scores[i])
            scored_docs.append(doc_copy)
        
        # Sort by rerank score (higher is better)
        scored_docs.sort(key=lambda x: x['rerank_score'], reverse=True)
        
        return scored_docs[:top_k]
        
    except Exception as e:
        app_logger.warning(f"Reranking failed: {e}, returning original order")
        return documents[:top_k]


def rerank_with_scores(
    query: str,
    documents: List[str],
    top_k: int = 5
) -> List[Tuple[str, float]]:
    """
    Simple reranking that returns (document, score) tuples.
    
    Args:
        query: The search query
        documents: List of document strings
        top_k: Number of top results
        
    Returns:
        List of (document, score) tuples sorted by score
    """
    if not documents:
        return []
    
    reranker = get_reranker()
    
    if reranker is None:
        return [(doc, 0.0) for doc in documents[:top_k]]
    
    try:
        pairs = [(query, doc) for doc in documents]
        scores = reranker.predict(pairs)
        
        # Combine and sort
        doc_scores = list(zip(documents, scores))
        doc_scores.sort(key=lambda x: x[1], reverse=True)
        
        return doc_scores[:top_k]
        
    except Exception as e:
        app_logger.warning(f"Reranking failed: {e}")
        return [(doc, 0.0) for doc in documents[:top_k]]
