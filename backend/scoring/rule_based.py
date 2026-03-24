import re
import textstat
from typing import Dict, List, Any
from bs4 import BeautifulSoup
from datetime import datetime


class RuleBasedScorer:
    """Rule-based GEO analysis using heuristics and metrics."""
    
    def analyze(self, content: str, metadata: Dict[str, Any], content_type: str = 'general') -> Dict[str, Any]:
        """
        Perform rule-based analysis on content.
        
        Args:
            content: The text content to analyze
            metadata: Metadata including headings, schema, etc.
            
        Returns:
            Dictionary of scores and suggestions
        """
        scores = {
            'structure': self._analyze_structure(content, metadata, content_type),
            'keywords': self._analyze_keywords(content),
            'authority': self._analyze_authority(content, metadata, content_type),
            'schema': self._analyze_schema(metadata, content_type),
            'freshness': self._analyze_freshness(content),
            'readability': self._analyze_readability(content)
        }
        
        return scores
    
    def _analyze_structure(self, content: str, metadata: Dict[str, Any], content_type: str) -> Dict[str, Any]:
        """Analyze content structure (headings, paragraphs, lists)."""
        score = 0
        suggestions = []
        details = {}
        
        headings = metadata.get('headings', {})
        
        # Check for H1
        h1_count = len(headings.get('h1', []))
        if h1_count == 1:
            score += 20
        elif h1_count == 0:
            suggestions.append("Add a single H1 heading to define the main topic")
        else:
            suggestions.append(f"Use only one H1 heading (found {h1_count})")
        
        # Check heading hierarchy
        h2_count = len(headings.get('h2', []))
        h3_count = len(headings.get('h3', []))
        
        if h2_count >= 2:
            score += 20
            details['h2_count'] = h2_count
        else:
            suggestions.append("Add more H2 headings to structure your content (target: 2+)")
        
        if h3_count >= 1:
            score += 10
            details['h3_count'] = h3_count
        else:
             suggestions.append("Add H3 subheadings for better depth")
        
        # Analyze paragraphs (Adaptive Splitting)
        # 1. Try splitting by double newline (standard)
        paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
        if not paragraphs:
             paragraphs = [content]
             
        avg_para_words = sum(len(p.split()) for p in paragraphs) / max(len(paragraphs), 1)
        
        # 2. If paragraphs seem huge (>100 words/para), user likely uses single newlines
        if avg_para_words > 100:
            # Fallback: Split by single newline, but ignore headers/lists
            lines = [line.strip() for line in content.split('\n') if line.strip()]
            paragraphs = [l for l in lines if not l.startswith(('#', '-', '*', '1.', '•'))]
            avg_para_words = sum(len(p.split()) for p in paragraphs) / max(len(paragraphs), 1)

        details['avg_paragraph_length'] = int(avg_para_words)
        
        if 20 <= avg_para_words <= 150:
            score += 20
        elif avg_para_words < 20:
            # Only suggest combining if very short (e.g. < 20 words)
            score += 20 # Give full points for short web paragraphs, just a hint maybe?
            # Actually, let's treat short paragraphs as GOOD for web.
            suggestions.append("Paragraphs are nice and short (good for web).") 
            # Or just silent success.
            # Let's keep a soft suggestion but not penalize score? 
            # No, if it's 3 words, it's weird. 
            pass 
        else:
            suggestions.append("Paragraphs seem too long. Break them into smaller chunks (max 150 words)")
        
        # Check for lists (Keep regex fix)
        list_indicators = re.findall(r'^\s*[-•*➢+]\s+|^\s*\d+\.\s+', content, re.MULTILINE)
        has_lists = len(list_indicators) >= 3
        
        if has_lists:
            score += 15
            details['has_lists'] = True
        else:
            suggestions.append("Add bullet points or numbered lists to improve scannability")
        
        # E-commerce Specific Structure (30 points total via weights later, but handled here)
        if content_type == 'ecommerce':
            # Check price visibility (first 200 chars or early on)
            first_200 = content[:200].lower()
            currency_symbols = ['$', '€', '£', 'price:', 'cost']
            has_early_price = any(c in first_200 for c in currency_symbols)
            
            if has_early_price:
                score += 20
                details['price_visible_early'] = True
            else:
                score -= 10 
                suggestions.append("Ensure Product Price is visible in the first paragraph/title")

            # Check for Specification Table / List
            # We look for markdown tables or tight lists
            has_table = '|' in content and '---' in content
            
            if has_table:
                score += 30
                details['has_spec_table'] = True
            elif has_lists:
                score += 15
                details['has_spec_list'] = True
                suggestions.append("Convert specification lists to HTML/Markdown Tables for better AI parsing")
            else:
                score -= 20
                suggestions.append("Critical: Add a Specifications Table for technical attributes")
                
            # Check for Comparison elements
            if "vs" in content.lower() or "comparison" in content.lower():
                score += 15
                details['has_comparison'] = True
            
            # Estimate attribute count (rough heuristic: table rows + list items with colons)
            attr_pattern = re.findall(r'^[-*]\s+[^:]+:', content, re.MULTILINE)
            attr_count = content.count('|') // 3 + len(attr_pattern) # very rough table rows + list attrs
            details['attribute_count'] = attr_count
            
            if attr_count >= 10:
                score += 15
            elif attr_count < 5:
                score -= 20
                suggestions.append("Add more technical attributes (target 10-15 specs)")
        else:
            # Check for summary/introduction
            first_para = paragraphs[0] if paragraphs else ""
            if len(first_para.split()) >= 30:
                score += 15
                details['has_intro'] = True
            else:
                suggestions.append("Add a comprehensive introduction paragraph (30+ words)")
        
        return {
            'score': min(score, 100),
            'details': details,
            'suggestions': suggestions[:3]
        }
    
    def _analyze_keywords(self, content: str) -> Dict[str, Any]:
        """Analyze keyword usage and optimization."""
        score = 0
        suggestions = []
        details = {}
        
        words = content.lower().split()
        word_count = len(words)
        
        # Question keywords (5W1H)
        question_words = ['what', 'why', 'how', 'when', 'where', 'who', 'which']
        question_count = sum(1 for line in content.lower().split('\n') if any(q in line for q in question_words))
        
        if question_count >= 3:
            score += 25
            details['question_based_headings'] = question_count
        else:
            suggestions.append("Add more question-based headings (What, Why, How) to match user intent")
        
        # Long-tail keywords (phrases of 3-5 words)
        long_tail_pattern = r'\b[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,3}\b'
        long_tail_matches = re.findall(long_tail_pattern, content)
        
        if len(long_tail_matches) >= 5:
            score += 25
            details['long_tail_keywords'] = len(long_tail_matches)
        else:
            suggestions.append("Include more long-tail keyword phrases (3-5 word combinations)")
        
        # Semantic variations (Standardized)
        unique_words = len(set(words))
        diversity_ratio = unique_words / max(word_count, 1)
        
        if diversity_ratio > 0.4:
            score += 25
            details['vocabulary_diversity'] = round(diversity_ratio, 2)
        else:
            suggestions.append("Increase vocabulary diversity slightly (target ratio: >0.4)")
        
        # Keyword density check (avoid stuffing)
        from collections import Counter
        word_freq = Counter(w for w in words if len(w) > 4)
        if word_freq:
            most_common = word_freq.most_common(1)[0]
            density = (most_common[1] / word_count) * 100
            
            if density < 3:
                score += 25
                details['keyword_density'] = round(density, 2)
            else:
                suggestions.append(f"Keyword density too high ({density:.1f}%). Reduce repetition.")
        
        return {
            'score': min(score, 100),
            'details': details,
            'suggestions': suggestions[:3]
        }
    
    def _analyze_authority(self, content: str, metadata: Dict[str, Any], content_type: str) -> Dict[str, Any]:
        """Analyze authority signals (E-E-A-T)."""
        score = 0
        suggestions = []
        details = {}
        
        word_count = len(content.split())
        details['word_count'] = word_count
        
        # Content length
        if word_count >= 1000:
            score += 30
        elif word_count >= 600:
            score += 20
            suggestions.append("Good start, but consider expanding to 1000+ words for better authority.")
        else:
            suggestions.append(f"Content is short ({word_count} words). Aim for 600-1000+ words.")
        
        # Check for citations/references
        citation_patterns = [
            r'according to',
            r'research shows',
            r'study found',
            r'data\s+shows',
            r'\d{4}\s+study',
            r'source:',
            r'\[\d+\]',  # Numbered citations
        ]
        
        citation_count = sum(len(re.findall(pattern, content.lower())) for pattern in citation_patterns)
        
        if content_type == 'ecommerce':
             score += 15 # Free points for ecommerce (citations not needed)
             details['citations'] = 0 
        else:
            if citation_count >= 3:
                score += 25
                details['citations'] = citation_count
            elif citation_count >= 1:
                score += 15
                details['citations'] = citation_count
                suggestions.append("Add more citations and references to authoritative sources")
            else:
                suggestions.append("Include citations, research, and data to establish authority")
        
        # Check for data/statistics
        number_pattern = r'\b\d+(?:\.\d+)?%|\b\d+(?:,\d{3})*(?:\.\d+)?\s+(?:percent|million|billion|thousand)\b'
        stat_count = len(re.findall(number_pattern, content))
        
        if stat_count >= 5:
            score += 25
            details['statistics'] = stat_count
        elif stat_count >= 2:
            score += 15
            details['statistics'] = stat_count
        else:
            suggestions.append("Include statistics and data points to support claims")
        
        # Check for author/expert mentions
        # E-Commerce Trust Signals (20 points total in theory)
        if content_type == 'ecommerce':
            details['is_ecommerce'] = True
            
            # Check for Reviews presence
            review_words = ['review', 'rating', 'stars', 'customer rating']
            has_reviews = any(w in content.lower() for w in review_words)
            
            if has_reviews:
                score += 40
                details['has_reviews'] = True
            else:
                score -= 20
                suggestions.append("Critical: Display customer reviews prominently on the page")
                
            # Check for Trust Badges/Certifications (heuristics)
            trust_words = ['warranty', 'guarantee', 'secure checkout', 'certified', 'free shipping', 'returns']
            trust_count = sum(1 for w in trust_words if w in content.lower())
            
            if trust_count >= 2:
                score += 20
                details['trust_signals'] = trust_count
            else:
                suggestions.append("Add trust signals like Guarantee, Warranty, or Secure Checkout policies")

        else:
            if metadata.get('author'):
                score += 20
                details['has_author'] = True
            else:
                 suggestions.append("Add author attribution to establish expertise")
        
        return {
            'score': min(score, 100),
            'details': details,
            'suggestions': suggestions[:3]
        }
    
    def _analyze_schema(self, metadata: Dict[str, Any], content_type: str) -> Dict[str, Any]:
        """Analyze structured data and schema markup."""
        score = 0
        suggestions = []
        details = {}
        
        schema_data = metadata.get('schema', {})
        schema_types = schema_data.get('types', [])
        
        # Check for schema markup
        # Check for schema markup
        if schema_types:
            details['schema_types'] = schema_types
            
            # E-Commerce Strict Schema Rules (35 points total logic)
            if content_type == 'ecommerce':
                # Product schema is mandatory
                if 'Product' in schema_types:
                    score += 40
                    details['has_product_schema'] = True
                else:
                    suggestions.append("CRITICAL: Missing Product Schema. AI will not cite without it.")
                    score -= 50  # Huge penalty
                
                # AggregateRating Bonus (3x citation multiplier in spec)
                if 'AggregateRating' in schema_types:
                    score += 30
                    details['has_aggregate_rating'] = True
                else:
                    suggestions.append("Add AggregateRating schema to multiply citation likelihood")
                
                # FAQ Schema Bonus for E-commerce
                if 'FAQPage' in schema_types:
                    score += 20
                    details['has_faq_schema'] = True
            else:
                score += 40
                geo_friendly = ['Article', 'FAQPage', 'HowTo', 'BlogPosting', 'NewsArticle']
                if any(s in schema_types for s in geo_friendly):
                    score += 30
                else:
                     target_schema = "FAQPage or HowTo"
                     suggestions.append(f"Consider adding {target_schema} schema for better AI visibility")
        else:
             target_schema = "Product (Mandatory)" if content_type == 'ecommerce' else "Article, FAQPage, or HowTo"
             suggestions.append(f"Add schema.org markup - {target_schema} - for AI search visibility")
        
        # Check for semantic HTML in headings
        headings = metadata.get('headings', {})
        if headings:
            score += 30
            details['has_semantic_html'] = True
        
        return {
            'score': min(score, 100),
            'details': details,
            'suggestions': suggestions[:3]
        }
    
    def _analyze_freshness(self, content: str) -> Dict[str, Any]:
        """Analyze content freshness signals."""
        score = 0
        suggestions = []
        details = {}
        
        current_year = datetime.now().year
        last_year = current_year - 1
        
        # Check for recent years
        year_mentions = re.findall(r'\b(20\d{2})\b', content)
        recent_years = [int(y) for y in year_mentions if int(y) >= last_year]
        
        if recent_years:
            score += 40
            details['recent_year_mentions'] = len(recent_years)
        # Removed the suggestion to forcibly add recent dates if none exist, as evergreen content is valid
        
        # Check for temporal indicators
        fresh_indicators = [
            'latest', 'recent', 'current', 'updated', 'new', '2024', '2025',
            'today', 'now', 'modern', 'contemporary'
        ]
        
        fresh_count = sum(1 for indicator in fresh_indicators if indicator in content.lower())
        
        if fresh_count >= 5:
            score += 40
            details['freshness_signals'] = fresh_count
        elif fresh_count >= 2:
            score += 20
            details['freshness_signals'] = fresh_count
            suggestions.append("Add more freshness signals (latest, updated, current, etc.)")
        else:
            suggestions.append("Include freshness indicators to show content is up-to-date")
        
        # Check for "updated" or "last modified" language
        update_patterns = ['updated:', 'last updated', 'modified:', 'revised:']
        has_update_date = any(pattern in content.lower() for pattern in update_patterns)
        
        if has_update_date:
            score += 20
            details['has_update_info'] = True
        # Removed suggestion to add "Last Updated" text as it's often a CMS feature, not content text
        
        return {
            'score': min(score, 100),
            'details': details,
            'suggestions': suggestions[:3]
        }
    
    def _analyze_readability(self, content: str) -> Dict[str, Any]:
        """Analyze technical readability metrics."""
        score = 0
        suggestions = []
        details = {}
        
        # Flesch Reading Ease (0-100 scale: higher = easier to read)
        # 0-30: Very difficult (college graduate level)
        # 30-50: Difficult (college level)
        # 50-60: Fairly difficult (high school)
        # 60-70: Standard (8th-9th grade) - IDEAL for web
        # 70-80: Fairly easy (7th grade)
        # 80-100: Very easy (5th grade or below)
        try:
            flesch = textstat.flesch_reading_ease(content)
            details['flesch_score'] = round(flesch, 1)
            
            # Widen the acceptable range: 50-80 is fine for most web content
            if 50 <= flesch <= 80:
                score += 35
            elif 40 <= flesch < 50 or 80 < flesch <= 90:
                score += 30 # Less penalty
                suggestions.append("Readability is okay, but could be slightly more conversational (aim for 60-70)")
            elif flesch < 40:
                # Content is too complex/academic
                score += 15
                suggestions.append(f"Readability score is {flesch:.0f}/100 (too complex). Use shorter sentences, simpler words. Aim for 50-80.")
            else:
                # Content is too simple (>90)
                score += 25
                suggestions.append(f"Readability score is {flesch:.0f}/100 (very simple). Consider adding more depth if targeting professionals.")
        except:
            pass # Don't penalize if calculation fails
        
        # Sentence length - Relaxed
        sentences = re.split(r'[.!?]+', content)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if sentences:
            avg_sentence_length = sum(len(s.split()) for s in sentences) / len(sentences)
            details['avg_sentence_length'] = round(avg_sentence_length, 1)
            
            if 10 <= avg_sentence_length <= 30: # Much wider range
                score += 35
            else:
                suggestions.append("Vary sentence length. Aim for 10-30 words per sentence on average")
        
        # Active voice - Relaxed
        words = content.lower().split()
        passive_indicators = words.count('was') + words.count('were') + words.count('been')
        passive_ratio = passive_indicators / max(len(words), 1)
        
        if passive_ratio < 0.05: # Increased tolerance from 0.02
            score += 30
            details['active_voice_dominant'] = True
        else:
            suggestions.append("Consider using more active voice for punchier content")
        
        return {
            'score': min(score, 100),
            'details': details,
            'suggestions': suggestions[:3]
        }
