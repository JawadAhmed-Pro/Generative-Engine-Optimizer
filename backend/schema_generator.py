"""
JSON-LD Schema Generator for GEO optimization.
Generates structured data markup for AI search engines.
"""
import json
import re
from typing import Dict, Any, List, Optional
from datetime import datetime


class SchemaGenerator:
    """Generates JSON-LD Schema.org markup for content."""
    
    def __init__(self):
        self.base_context = "https://schema.org"
    
    def generate_schema(
        self,
        content: str,
        content_type: str = "article",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate appropriate JSON-LD schema based on content type.
        
        Args:
            content: The text content
            content_type: 'article', 'product', 'faq', 'howto'
            metadata: Optional metadata (title, author, url, etc.)
            
        Returns:
            Dict containing schema_type, json_ld, and html_snippet
        """
        metadata = metadata or {}
        
        if content_type == "product":
            schema = self._generate_product_schema(content, metadata)
        elif content_type == "faq":
            schema = self._generate_faq_schema(content, metadata)
        elif content_type == "howto":
            schema = self._generate_howto_schema(content, metadata)
        else:
            schema = self._generate_article_schema(content, metadata)
        
        # Format as HTML snippet
        html_snippet = f'<script type="application/ld+json">\n{json.dumps(schema, indent=2)}\n</script>'
        
        return {
            "schema_type": schema.get("@type", "Article"),
            "json_ld": schema,
            "html_snippet": html_snippet
        }
    
    def _generate_article_schema(self, content: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Generate Article schema with Phase B Entity Linking."""
        # Extract first paragraph as description
        paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
        description = paragraphs[0][:200] if paragraphs else content[:200]
        
        # Extract headings for article sections
        headings = re.findall(r'^#+\s*(.+)$', content, re.MULTILINE)
        
        schema = {
            "@context": self.base_context,
            "@type": "Article",
            "headline": metadata.get("title", headings[0] if headings else "Untitled Article"),
            "description": description,
            "author": {
                "@type": "Person",
                "name": metadata.get("author", "Content Creator")
            },
            "datePublished": metadata.get("date_published", datetime.now().isoformat()),
            "dateModified": metadata.get("date_modified", datetime.now().isoformat()),
        }
        
        # Phase B: Add Mentions (Knowledge Graph Entities)
        entities = metadata.get("entities", [])
        if entities:
            mentions = []
            for ent in entities:
                if isinstance(ent, dict) and "name" in ent and "uri" in ent:
                    mentions.append({
                        "@type": "Thing",
                        "name": ent["name"],
                        "sameAs": ent["uri"]
                    })
            if mentions:
                schema["mentions"] = mentions
        
        # Add URL if provided
        if metadata.get("url"):
            schema["url"] = metadata["url"]
            schema["mainEntityOfPage"] = {
                "@type": "WebPage",
                "@id": metadata["url"]
            }
        
        # Add image if provided
        if metadata.get("image"):
            schema["image"] = metadata["image"]
        
        # Add publisher
        schema["publisher"] = {
            "@type": "Organization",
            "name": metadata.get("publisher", "GEO Optimized Content"),
            "logo": {
                "@type": "ImageObject",
                "url": metadata.get("logo", "https://example.com/logo.png")
            }
        }
        
        # Add word count
        schema["wordCount"] = len(content.split())
        
        # Add article sections from headings
        if len(headings) > 1:
            schema["articleSection"] = headings[:5]
        
        return schema
    
    def _generate_product_schema(self, content: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Generate Product schema for e-commerce."""
        # Try to extract price from content
        price_match = re.search(r'\$?([\d,]+(?:\.\d{2})?)', content)
        price = price_match.group(1).replace(',', '') if price_match else "0.00"
        
        schema = {
            "@context": self.base_context,
            "@type": "Product",
            "name": metadata.get("title", "Product"),
            "description": content[:500],
            "offers": {
                "@type": "Offer",
                "price": metadata.get("price", price),
                "priceCurrency": metadata.get("currency", "USD"),
                "availability": "https://schema.org/InStock",
                "seller": {
                    "@type": "Organization",
                    "name": metadata.get("seller", "Store")
                }
            }
        }
        
        # Add optional fields
        if metadata.get("sku"):
            schema["sku"] = metadata["sku"]
        
        if metadata.get("brand"):
            schema["brand"] = {
                "@type": "Brand",
                "name": metadata["brand"]
            }
        
        if metadata.get("image"):
            schema["image"] = metadata["image"]
        
        if metadata.get("rating"):
            schema["aggregateRating"] = {
                "@type": "AggregateRating",
                "ratingValue": metadata["rating"],
                "reviewCount": metadata.get("review_count", 1)
            }
        
        return schema
    
    def _generate_faq_schema(self, content: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Generate FAQPage schema from Q&A content."""
        # Extract Q&A pairs from content
        qa_pairs = self._extract_qa_pairs(content)
        
        main_entity = []
        for q, a in qa_pairs:
            main_entity.append({
                "@type": "Question",
                "name": q,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": a
                }
            })
        
        schema = {
            "@context": self.base_context,
            "@type": "FAQPage",
            "mainEntity": main_entity if main_entity else [{
                "@type": "Question",
                "name": metadata.get("title", "Frequently Asked Question"),
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": content[:500]
                }
            }]
        }
        
        return schema
    
    def _generate_howto_schema(self, content: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Generate HowTo schema for tutorial content."""
        # Extract steps from content
        steps = self._extract_steps(content)
        
        howto_steps = []
        for i, step in enumerate(steps, 1):
            howto_steps.append({
                "@type": "HowToStep",
                "position": i,
                "name": f"Step {i}",
                "text": step
            })
        
        schema = {
            "@context": self.base_context,
            "@type": "HowTo",
            "name": metadata.get("title", "How-To Guide"),
            "description": content[:200],
            "step": howto_steps if howto_steps else [{
                "@type": "HowToStep",
                "position": 1,
                "name": "Step 1",
                "text": content[:500]
            }]
        }
        
        # Add optional fields
        if metadata.get("total_time"):
            schema["totalTime"] = metadata["total_time"]
        
        if metadata.get("image"):
            schema["image"] = metadata["image"]
        
        return schema
    
    def _extract_qa_pairs(self, content: str) -> List[tuple]:
        """Extract question-answer pairs from content."""
        pairs = []
        
        # Pattern 1: Q: ... A: ...
        qa_pattern = re.findall(r'Q:\s*(.+?)\s*A:\s*(.+?)(?=Q:|$)', content, re.DOTALL | re.IGNORECASE)
        if qa_pattern:
            pairs.extend(qa_pattern)
        
        # Pattern 2: **Question?** Answer...
        question_pattern = re.findall(r'\*\*(.+?\?)\*\*\s*(.+?)(?=\*\*|$)', content, re.DOTALL)
        if question_pattern:
            pairs.extend(question_pattern)
        
        # Pattern 3: Lines ending with ? followed by answer
        lines = content.split('\n')
        i = 0
        while i < len(lines) - 1:
            if lines[i].strip().endswith('?'):
                question = lines[i].strip()
                answer = lines[i + 1].strip()
                if answer and not answer.endswith('?'):
                    pairs.append((question, answer))
                    i += 2
                    continue
            i += 1
        
        return pairs[:10]  # Limit to 10 pairs
    
    def _extract_steps(self, content: str) -> List[str]:
        """Extract steps from numbered or bulleted content."""
        steps = []
        
        # Pattern 1: Numbered steps (1. Step, 2. Step)
        numbered = re.findall(r'^\d+[\.\)]\s*(.+)$', content, re.MULTILINE)
        if numbered:
            steps.extend(numbered)
        
        # Pattern 2: Bullet points
        bullets = re.findall(r'^[\-\*]\s*(.+)$', content, re.MULTILINE)
        if bullets and not steps:
            steps.extend(bullets)
        
        return steps[:10]  # Limit to 10 steps
    
    def detect_schema_type(self, content: str, metadata: Optional[Dict] = None) -> str:
        """Auto-detect the best schema type for content."""
        content_lower = content.lower()
        
        # Check for FAQ patterns
        if re.search(r'(FAQ|frequently asked|Q:|question)', content, re.IGNORECASE):
            return "faq"
        
        # Check for HowTo patterns
        if re.search(r'(how to|step by step|tutorial|guide)', content_lower):
            if re.search(r'^\d+[\.\)]', content, re.MULTILINE):
                return "howto"
        
        # Check for Product patterns
        if re.search(r'(\$\d+|price|buy now|add to cart|in stock)', content_lower):
            return "product"
        
        # Default to article
        return "article"


# Singleton instance
schema_generator = SchemaGenerator()
