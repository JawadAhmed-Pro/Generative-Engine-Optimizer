from typing import List, Dict, Any
import re
from config import settings


class ContentChunker:
    """Chunks content for vector storage while preserving context."""
    
    def __init__(self, chunk_size: int = None, chunk_overlap: int = None):
        self.chunk_size = chunk_size or settings.CHUNK_SIZE
        self.chunk_overlap = chunk_overlap or settings.CHUNK_OVERLAP
    
    def chunk_content(self, content: str, metadata: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Chunk content semantically while preserving structure.
        
        Args:
            content: The text content to chunk
            metadata: Metadata about the source (title, URL, etc.)
            
        Returns:
            List of chunks with metadata
        """
        # Split by headings and paragraphs
        sections = self._split_by_structure(content)
        
        # Create chunks
        chunks = []
        current_heading = ""
        position = 0
        
        for section in sections:
            if section['type'] == 'heading':
                current_heading = section['content']
            else:
                # Chunk the paragraph if it's too long
                paragraph_chunks = self._chunk_paragraph(
                    section['content'],
                    current_heading,
                    position
                )
                
                for chunk in paragraph_chunks:
                    chunks.append({
                        'content': chunk['content'],
                        'metadata': {
                            **metadata,
                            'heading': current_heading,
                            'position': chunk['position'],
                            'type': 'content_chunk',
                            'chunk_index': len(chunks)
                        }
                    })
                    position = chunk['position'] + 1
        
        return chunks
    
    def _split_by_structure(self, content: str) -> List[Dict[str, str]]:
        """Split content by headings and paragraphs."""
        sections = []
        lines = content.split('\n')
        
        current_paragraph = []
        
        for line in lines:
            line = line.strip()
            if not line:
                if current_paragraph:
                    sections.append({
                        'type': 'paragraph',
                        'content': ' '.join(current_paragraph)
                    })
                    current_paragraph = []
                continue
            
            # Check if it's a heading (heuristic: short, possibly all caps or title case)
            if self._is_likely_heading(line):
                if current_paragraph:
                    sections.append({
                        'type': 'paragraph',
                        'content': ' '.join(current_paragraph)
                    })
                    current_paragraph = []
                sections.append({
                    'type': 'heading',
                    'content': line
                })
            else:
                current_paragraph.append(line)
        
        # Add final paragraph
        if current_paragraph:
            sections.append({
                'type': 'paragraph',
                'content': ' '.join(current_paragraph)
            })
        
        return sections
    
    def _is_likely_heading(self, text: str) -> bool:
        """Heuristic to detect if a line is likely a heading."""
        # Short lines (<100 chars)
        if len(text) > 100:
            return False
        
        # No ending punctuation except ? or :
        if text[-1] in '.!,;' and text[-1] not in '?:':
            return False
        
        # Title case or all caps
        words = text.split()
        if len(words) > 0:
            capitalized = sum(1 for w in words if w[0].isupper() if w)
            if capitalized / len(words) > 0.6 or text.isupper():
                return True
        
        return False
    
    def _chunk_paragraph(self, paragraph: str, heading: str, start_position: int) -> List[Dict[str, Any]]:
        """Chunk a long paragraph into smaller pieces."""
        words = paragraph.split()
        
        if len(words) <= self.chunk_size:
            return [{
                'content': f"{heading}\n\n{paragraph}" if heading else paragraph,
                'position': start_position
            }]
        
        chunks = []
        i = 0
        position = start_position
        
        while i < len(words):
            # Take chunk_size words
            chunk_words = words[i:i + self.chunk_size]
            chunk_text = ' '.join(chunk_words)
            
            # Add heading context to first chunk
            if i == 0 and heading:
                chunk_text = f"{heading}\n\n{chunk_text}"
            
            chunks.append({
                'content': chunk_text,
                'position': position
            })
            
            # Move forward with overlap
            i += self.chunk_size - self.chunk_overlap
            position += 1
        
        return chunks
    
    def estimate_tokens(self, text: str) -> int:
        """Estimate token count (rough approximation: 1 token ≈ 4 chars)."""
        return len(text) // 4
