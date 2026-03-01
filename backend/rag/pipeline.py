from typing import List, Dict, Any
from vector_store import VectorStore
from config import settings
# import google.generativeai as genai # Removed Gemini dependency
import requests
import json


class RAGPipeline:
    """LangChain-inspired RAG pipeline for generating insights."""
    
    def __init__(self):
        self.vector_store = VectorStore()
        
        if settings.GROQ_API_KEY:
             self.api_key = settings.GROQ_API_KEY
             self.model = settings.GROQ_MODEL
        else:
            self.model = None
            self.api_key = None
    
    def generate_insights(
        self,
        content_item_id: int,
        insight_type: str,
        analysis_results: Dict[str, Any]
    ) -> str:
        """
        Generate insights using RAG.
        
        Args:
            content_item_id: ID of the content item
            insight_type: Type of insight ('explanation', 'recommendations', 'rewrite')
            analysis_results: The analysis results for context
            
        Returns:
            Generated insights as text
        """
        if not self.api_key:
            return "Groq API key not configured. Please add GROQ_API_KEY to .env file."
        
        # Retrieve relevant chunks
        chunks = self.vector_store.get_chunks_by_content_item(content_item_id)
        
        # Build context
        context = self._build_context(chunks, analysis_results)
        
        # Generate based on type
        if insight_type == 'explanation':
            return self._generate_explanation(context)
        elif insight_type == 'recommendations':
            return self._generate_recommendations(context)
        elif insight_type == 'rewrite':
            return self._generate_rewrite(context)
        else:
            return "Unknown insight type"
    
    def _build_context(
        self,
        chunks: List[Dict[str, Any]],
        analysis_results: Dict[str, Any]
    ) -> str:
        """Build context from chunks and scores."""
        # Extract content snippets
        content_snippets = [chunk['content'] for chunk in chunks[:5]]  # Top 5 chunks
        
        # Extract scores
        ai_vis = analysis_results.get('ai_visibility_score', 0)
        citation = analysis_results.get('citation_worthiness_score', 0)
        semantic = analysis_results.get('semantic_coverage_score', 0)
        readability = analysis_results.get('technical_readability_score', 0)
        
        context = f"""Content Snippets:
{chr(10).join(f"- {snippet[:200]}..." for snippet in content_snippets)}

GEO Scores:
- AI Search Visibility: {ai_vis}/100
- Citation Worthiness: {citation}/100
- Semantic Coverage: {semantic}/100
- Technical Readability: {readability}/100
"""
        return context
    
    def _generate_content(self, prompt: str) -> str:
        """Helper to call Groq API."""
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": "You are a generic engine optimization expert."},
                {"role": "user", "content": prompt}
            ]
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            if response.status_code == 200:
                return response.json()['choices'][0]['message']['content']
            else:
                return f"Error from Groq: {response.text}"
        except Exception as e:
            return f"Error calling Groq: {str(e)}"
    
    def _generate_explanation(self, context: str) -> str:
        """Generate explanation for why scores are what they are."""
        prompt = f"""{context}

As a GEO expert, explain why these scores were assigned. Be specific and reference the content characteristics that led to these scores. Keep explanations concise and actionable.

Focus on:
1. What's working well
2. What's holding the scores back
3. Key areas for improvement"""
        
        return self._generate_content(prompt)
    
    def _generate_recommendations(self, context: str) -> str:
        """Generate prioritized action items."""
        prompt = f"""{context}

As a GEO expert, provide 5-7 specific, actionable recommendations to improve these scores for AI search visibility.

Format as a numbered list. Each recommendation should:
- Be specific and concrete
- Explain WHY it will help
- Be immediately actionable

Prioritize high-impact changes first."""
        
        return self._generate_content(prompt)
    
    def _generate_rewrite(self, context: str) -> str:
        """Generate content rewrite suggestions."""
        prompt = f"""{context}

As a GEO expert, provide before/after rewrite suggestions for 2-3 sections of the content.

For each suggestion:
1. Show the BEFORE (original problematic text)
2. Show the AFTER (improved version optimized for AI search)
3. Explain what changed and why it's better for GEO

Focus on:
- Adding question-based headings
- Improving answer directness
- Adding semantic richness
- Enhancing structure"""
        
        return self._generate_content(prompt)
