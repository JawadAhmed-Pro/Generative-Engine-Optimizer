import chromadb
from typing import List, Dict, Any, Optional
from config import settings
import uuid
from logger import app_logger


class VectorStore:
    """Manages ChromaDB for semantic search and RAG retrieval."""
    
    def __init__(self):
        # Initialize ChromaDB client with persistence
        self.client = chromadb.PersistentClient(
            path=settings.CHROMA_PERSIST_DIR
        )
        
        # Get or create collection with default embedding function
        try:
            self.collection = self.client.get_collection(
                name=settings.CHROMA_COLLECTION_NAME
            )
        except:
            # Create collection with default embedding function
            self.collection = self.client.create_collection(
                name=settings.CHROMA_COLLECTION_NAME,
                metadata={"description": "GEO content chunks"}
            )
    
    def add_chunks(self, chunks: List[Dict[str, Any]], content_item_id: int) -> List[str]:
        """
        Add content chunks to the vector store.
        
        Args:
            chunks: List of chunk dictionaries with 'content' and 'metadata'
            content_item_id: ID of the content item these chunks belong to
            
        Returns:
            List of chunk IDs
        """
        if not chunks:
            return []
        
        # Prepare data for ChromaDB
        ids = []
        documents = []
        metadatas = []
        
        for chunk in chunks:
            chunk_id = f"{content_item_id}_{chunk['metadata'].get('chunk_index', uuid.uuid4())}"
            ids.append(chunk_id)
            documents.append(chunk['content'])
            
            # Flatten metadata and add content_item_id
            metadata = {
                'content_item_id': content_item_id,
                'heading': chunk['metadata'].get('heading', ''),
                'position': chunk['metadata'].get('position', 0),
                'chunk_index': chunk['metadata'].get('chunk_index', 0),
                'title': str(chunk['metadata'].get('title', '')),
                'url': str(chunk['metadata'].get('url', '')),
            }
            metadatas.append(metadata)
        
        # Add to collection
        self.collection.add(
            ids=ids,
            documents=documents,
            metadatas=metadatas
        )
        
        return ids
    
    def similarity_search(
        self,
        query: str,
        content_item_id: Optional[int] = None,
        n_results: int = 5,
        use_reranking: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Search for similar chunks using semantic similarity with optional reranking.
        
        Args:
            query: The search query
            content_item_id: Optional filter by content item
            n_results: Number of results to return
            use_reranking: Whether to rerank results with cross-encoder (default True)
            
        Returns:
            List of relevant chunks with metadata, reranked for quality
        """
        # Build where filter
        where_filter = None
        if content_item_id is not None:
            where_filter = {"content_item_id": content_item_id}
        
        # Get more candidates if reranking (reranker will pick best ones)
        fetch_count = n_results * 3 if use_reranking else n_results
        
        # Query the collection
        results = self.collection.query(
            query_texts=[query],
            n_results=fetch_count,
            where=where_filter if where_filter else None
        )
        
        # Format results
        chunks = []
        if results['documents'] and results['documents'][0]:
            for i, doc in enumerate(results['documents'][0]):
                chunks.append({
                    'content': doc,
                    'metadata': results['metadatas'][0][i] if results['metadatas'] else {},
                    'distance': results['distances'][0][i] if results.get('distances') else None
                })
        
        # Apply reranking if enabled and we have results
        if use_reranking and chunks:
            try:
                from reranker import rerank_results
                chunks = rerank_results(query, chunks, top_k=n_results)
            except ImportError:
                # Reranker not available, just return top n_results
                chunks = chunks[:n_results]
            except Exception as e:
                app_logger.warning(f"Reranking failed: {e}")
                chunks = chunks[:n_results]
        else:
            chunks = chunks[:n_results]
        
        return chunks
    
    def get_chunks_by_content_item(self, content_item_id: int) -> List[Dict[str, Any]]:
        """Get all chunks for a specific content item."""
        results = self.collection.get(
            where={"content_item_id": content_item_id}
        )
        
        chunks = []
        if results['documents']:
            for i, doc in enumerate(results['documents']):
                chunks.append({
                    'id': results['ids'][i],
                    'content': doc,
                    'metadata': results['metadatas'][i] if results['metadatas'] else {}
                })
        
        return chunks
    
    def delete_chunks_by_content_item(self, content_item_id: int):
        """Delete all chunks for a content item."""
        self.collection.delete(
            where={"content_item_id": content_item_id}
        )
    
    def get_collection_stats(self) -> Dict[str, Any]:
        """Get statistics about the vector store."""
        count = self.collection.count()
        return {
            'total_chunks': count,
            'collection_name': settings.CHROMA_COLLECTION_NAME
        }
