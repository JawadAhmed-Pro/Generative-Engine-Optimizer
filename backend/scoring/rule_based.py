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
            suggestions.append("Add more H2 headings (Medium Impact: +10% Visibility)")
        
        if h3_count >= 1:
            score += 10
            details['h3_count'] = h3_count
        else:
             suggestions.append("Add H3 subheadings for deeper semantic structure")
        
        # Heading scanability (Medium)
        long_headings = [h for level in headings.values() for h in level if len(h.split()) > 12]
        if long_headings:
            suggestions.append("Shorten long headings to 4-10 words for better scanability")
        
        # TOC for long content (Medium)
        word_count = len(content.split())
        if word_count > 1000 and "table of contents" not in content.lower() and "contents" not in content.lower():
            suggestions.append("Add a Table of Contents to improve navigation for long-form content")
        
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
            suggestions.append("Add bullet points or numbered lists (Medium Impact: +15% Lift)")
        
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
                suggestions.append("Display Product Price early in content (Critical for E-commerce Search)")

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
            suggestions.append("Add a comprehensive introduction paragraph (30+ words)")
        
        # Paragraph Variety (Medium)
        para_lengths = [len(p.split()) for p in paragraphs]
        if len(para_lengths) > 3:
            std_dev = (sum((x - avg_para_words)**2 for x in para_lengths) / len(para_lengths))**0.5
            if std_dev < 10:
                suggestions.append("Vary paragraph lengths to improve visual rhythm and engagement")
        
        return {
            'score': min(score, 100),
            'details': details,
            'suggestions': suggestions
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
        
        # Topic in H2 (Medium)
        # Simple heuristic: see if the most frequent word (non-stopword) is in an H2
        if headings.get('h2') and word_freq:
            most_freq_word = word_freq.most_common(1)[0][0]
            if not any(most_freq_word in h.lower() for h in headings['h2']):
                suggestions.append(f"Include your main topic ({most_freq_word}) in at least one H2 subheading")
        
        # Bolded Keywords (Medium)
        bold_pattern = r'\*\*.*?\*\*|__.*?__|<strong>.*?<\/strong>|<b>.*?<\/b>'
        if not re.search(bold_pattern, content):
            suggestions.append("Bold important terms or keywords to help AI and humans scan the content")
            
        return {
            'score': min(score, 100),
            'details': details,
            'suggestions': suggestions
        }
    
    def _analyze_authority(self, content: str, metadata: Dict[str, Any], content_type: str) -> Dict[str, Any]:
        """Analyze authority signals (E-E-A-T) including 2025 GEO grounding."""
        score = 0
        suggestions = []
        details = {}
        
        word_count = len(content.split())
        details['word_count'] = word_count
        
        # 1. Expert Mentions (NEW: 2025 Lift)
        expert_pattern = r'"[^"]+" (?:says|claims|stated|according to) (?:Dr\.|Prof\.|Mr\.|Ms\.)? [A-Z][a-z]+ [A-Z][a-z]+(?:, [A-Z]{2,4}| PhD| CEO| Lead| Director)?'
        credential_pattern = r'\b(PhD|M\.D\.|M\.S\.|CEO|CTO|Scientist|Professor|Head of|Director of|Founder)\b'
        
        expert_quotes = len(re.findall(expert_pattern, content))
        expert_keywords = len(re.findall(credential_pattern, content))
        
        expert_mentions = expert_quotes + (expert_keywords // 2)
        details['expert_mentions'] = expert_mentions
        
        if expert_mentions >= 2:
            score += 30
        elif expert_mentions >= 1:
            score += 15
            suggestions.append("Add more named expert quotes with credentials (High Impact: +35% Lift)")
        else:
            suggestions.append("Add expert quotations (e.g., 'says Dr. Smith, Lead Scientist') (High Impact: +35% Lift)")

        # 2. Fact / Data Density (NEW: 2025 Lift)
        number_pattern = r'\b\d+(?:\.\d+)?%|\b\d+(?:,\d{3})*(?:\.\d+)?\s+(?:percent|million|billion|thousand)\b|\b(19|20)\d{2}\b'
        stat_count = len(re.findall(number_pattern, content))
        details['statistics'] = stat_count
        
        # Fact density per 200 words
        fact_density = stat_count / max(word_count / 200, 1)
        details['fact_density'] = round(fact_density, 2)
        
        if fact_density >= 1.5:
            score += 30
        elif fact_density >= 0.5:
            score += 15
        else:
            suggestions.append("Increase fact density to 1+ per 200 words (High Impact: +30% Lift)")

        # 3. Inline Source Citations
        citation_patterns = [r'according to', r'source:', r'\[\d+\]', r'\(202\d\)']
        citation_count = sum(len(re.findall(p, content.lower())) for p in citation_patterns)
        details['citations'] = citation_count
        
        if citation_count >= 3:
            score += 20
        elif citation_count >= 1:
             score += 10
             suggestions.append("Add 3+ inline source citations (Medium Impact: +31% Lift)")
        else:
            suggestions.append("Include inline source citations (e.g., [1] or according to Study X) (Medium Impact: +31% Lift)")
        
        # Outbound Authority Links (Medium)
        outbound_links = metadata.get('links', [])
        authority_links = [l for l in outbound_links if any(ext in l.lower() for ext in ['.gov', '.edu', '.org', 'wikipedia.org', 'reuters.com', 'bloomberg.com'])]
        if len(authority_links) == 0 and len(outbound_links) > 0:
            suggestions.append("Link to high-authority external sources (.edu, .gov) to bolster credibility")
        elif len(outbound_links) == 0:
            suggestions.append("Add outbound links to authoritative external references (Medium Impact)")
        
        # 4. Content Type Specifics (Ecom Trust)
        if content_type == 'ecommerce':
            review_words = ['review', 'rating', 'stars', 'customer says']
            if any(w in content.lower() for w in review_words):
                score += 20
                details['has_reviews'] = True
            else:
                suggestions.append("Add customer reviews to increase E-commerce trust signals.")
        else:
            if metadata.get('author'):
                score += 20
                details['has_author'] = True
            else:
                 suggestions.append("Add author attribution to establish expertise")

        # Call to Action (Medium)
        cta_words = ['contact', 'subscribe', 'buy', 'learn more', 'get started', 'sign up', 'download', 'order', 'click']
        if not any(w in content.lower() for w in cta_words):
            suggestions.append("Add a clear Call to Action (CTA) to guide the next user step")
            
        return {
            'score': min(score, 100),
            'details': details,
            'suggestions': suggestions
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
                     suggestions.append(f"Add {target_schema} schema (High Impact: +60% Probability Lift)")
        else:
             target_schema = "Product (Mandatory)" if content_type == 'ecommerce' else "Article, FAQPage, or HowTo"
             suggestions.append(f"Missing Schema.org markup (Critical Impact: Highly Recommended for AI Visibility)")
        
        # Phase 2: Deterministic Entity Linking (Knowledge Graph Anchoring)
        schema_raw_str = str(schema_data.get('raw', '')).lower()
        if 'sameas' in schema_raw_str or '"sameas"' in schema_raw_str:
            score += 20
            details['has_same_as_entities'] = True
            suggestions.insert(0, "✅ Excellent: 'sameAs' entity linking detected. High confidence retrieval signal.")
        else:
            suggestions.append("Add 'sameAs' schema properties pointing to Wikidata/Wikipedia to anchor entities (High Impact)")
            
        if 'about' in schema_raw_str or 'mentions' in schema_raw_str:
            score += 15
            details['has_about_mentions'] = True
            
        # Check for semantic HTML in headings
        headings = metadata.get('headings', {})
        if headings:
            score += 30
            details['has_semantic_html'] = True
        
        return {
            'score': min(score, 100),
            'details': details,
            'suggestions': suggestions
        }
    
    def _analyze_freshness(self, content: str) -> Dict[str, Any]:
        """Analyze content freshness signals (2025/26 Recency)."""
        score = 0
        suggestions = []
        details = {}
        
        # Perplexity & AI Search Benchmarks prioritize 2025/2026 dates
        recent_year_pattern = r'\b(2025|2026)\b'
        recent_years = len(re.findall(recent_year_pattern, content))
        
        if recent_years > 0:
            score += 50
            details['v2025_recency'] = True
        
        # Check for "Last Updated" metadata markers
        update_patterns = ['last updated', 'updated:', 'modified:', '2025-', '2026-']
        has_update_info = any(p in content.lower() for p in update_patterns)
        details['has_update_info'] = has_update_info
        
        if has_update_info:
            score += 50
        else:
            # 2025 Factor: Perplexity drops older content by 63%
            suggestions.append("Include 'Last Updated 2025' text (Critical Impact: Prevents -63% Decay Penalty)")
            
        return {
            'score': min(score, 100),
            'details': details,
            'suggestions': suggestions
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
        
        # Transition words (Medium)
        transitions = ['however', 'furthermore', 'moreover', 'consequently', 'therefore', 'additionally', 'similarly', 'conversely', 'notably', 'specifically']
        transition_count = sum(1 for t in transitions if t in content.lower())
        if transition_count < 5:
            suggestions.append("Use more transition words (e.g., 'Moreover', 'Specifically') to improve logical flow")
            
        return {
            'score': min(score, 100),
            'details': details,
            'suggestions': suggestions
        }
