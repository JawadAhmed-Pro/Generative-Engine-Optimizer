from typing import List, Dict, Any
from vector_store import VectorStore
from config import settings
import aiohttp
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
    
    async def generate_insights(
        self,
        content_item_id: int,
        insight_type: str,
        analysis_results: Dict[str, Any]
    ) -> str:
        """
        Generate insights using RAG.
        """
        if not self.api_key:
            return "Groq API key not configured. Please add GROQ_API_KEY to .env file."
        
        # Retrieve relevant chunks
        chunks = self.vector_store.get_chunks_by_content_item(content_item_id)
        
        # Build context
        context = self._build_context(chunks, analysis_results)
        
        # Generate based on type
        if insight_type == 'explanation':
            return await self._generate_explanation(context)
        elif insight_type == 'recommendations':
            return await self._generate_recommendations(context)
        elif insight_type == 'rewrite':
            return await self._generate_rewrite(context)
        else:
            return "Unknown insight type"
    
    def _build_context(
        self,
        chunks: List[Dict[str, Any]],
        analysis_results: Dict[str, Any]
    ) -> str:
        """Build context from chunks and scores with high alignment to UI."""
        # Extract content snippets
        content_snippets = [chunk['content'] for chunk in chunks[:12]]  # Increased context
        
        # Extract Pillar Scores (The UI Labels)
        ai_vis = analysis_results.get('structural_clarity_score', 0)
        citation = analysis_results.get('citation_worthiness_score', 0)
        semantic = analysis_results.get('semantic_coverage_score', 0)
        readability = analysis_results.get('freshness_authority_score', 0)
        
        # Extract Detailed Metrics (The "Under the Hood" data)
        llm_scores = analysis_results.get('llm_scores', {})
        
        # 1. Visibility Details
        vis_details = llm_scores.get('structural_clarity', {}).get('details', {})
        ai_formatting = vis_details.get('ai_friendly_formatting', 0)
        structural = vis_details.get('structural_integrity', 0)
        
        # 2. Citation Details
        cite_details = llm_scores.get('citation_worthiness', {}).get('details', {})
        cite_rate = analysis_results.get('eeat_analysis', {}).get('trustworthiness', 0)
        facts = cite_details.get('facts_density', 0)
        
        # 3. Semantic Details
        sem_details = llm_scores.get('semantic_coverage', {}).get('details', {})
        richness = sem_details.get('semantic_richness', 0)
        alignment = sem_details.get('user_intent_alignment', 0)
        
        # 4. Readability Details
        read_details = llm_scores.get('freshness_authority', {}).get('details', {})
        ux_score = read_details.get('readability_ux', 0)

        context = f"""[DETAILED GEO PERFORMANCE DATA]
- Overall Structural Score: {ai_vis}/100
  * AI-Friendly Formatting: {ai_formatting}/100
  * Structural Integrity: {structural}/100

- Overall Citation Worthiness: {citation}/100
  * Trustworthiness/EEAT: {cite_rate}/100
  * Fact Density: {facts} per 100 words

- Overall Semantic Coverage: {semantic}/100
  * Semantic Richness: {richness}/100
  * User Intent Alignment: {alignment}/100

- Overall Technical Readability: {readability}/100
  * Readability UX & Flow: {ux_score}/100

[SOURCE CONTENT SNIPPETS]
{chr(10).join(f"Snippet {i+1}: {snippet[:800]}" for i, snippet in enumerate(content_snippets))}
"""
        return context
    
    async def _generate_content(self, prompt: str) -> str:
        """Helper to call Groq API asynchronously."""
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": "You are a world-class GEO (Generative Engine Optimization) strategist. Your goal is to explain audit scores and provide actionable improvements. CRITICAL RULE: Never hallucinate content. Only reference information provided in the [SOURCE CONTENT SNIPPETS]. If you suggest a rewrite, the 'BEFORE' text MUST be a direct quote from the snippets provided."},
                {"role": "user", "content": prompt}
            ]
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data['choices'][0]['message']['content']
                    else:
                        text = await response.text()
                        return f"Error from Groq: {text}"
        except Exception as e:
            return f"Error calling Groq: {str(e)}"
    
    async def _generate_explanation(self, context: str) -> str:
        """Generate explanation for why scores are what they are."""
        prompt = f"""{context}

As a GEO expert, analyze these specific data points. 
Explain why the scores are what they are by referencing the metrics (e.g. 'Your Fact Density is low because...') and the source snippets.

Structure your response:
1. THE VERDICT: A 1-sentence summary of overall visibility.
2. STRENGTHS: What is working based on the scores.
3. CRITICAL GAPS: Why specific scores (mention them by name) are lower than ideal.
4. ACTIONABLE INSIGHT: One major takeaway."""
        
        return await self._generate_content(prompt)
    
    async def _generate_recommendations(self, context: str) -> str:
        """Generate prioritized action items."""
        prompt = f"""{context}

As a GEO expert, provide 5 specific, high-impact recommendations to improve the metrics provided.

Each recommendation MUST target a specific metric (e.g. 'To improve Semantic Richness, you should...').
Reference the SOURCE CONTENT SNIPPETS to show where the changes should be made."""
        
        return await self._generate_content(prompt)
    
    async def _generate_rewrite(self, context: str) -> str:
        """Generate content rewrite suggestions."""
        prompt = f"""{context}

As a GEO expert, provide before/after rewrite suggestions for 2-3 sections of the content.

STRICT GUARDRAILS:
- The 'BEFORE' text MUST be a verbatim quote from one of the [SOURCE CONTENT SNIPPETS]. Do NOT invent or generalize the before text.
- If you cannot find a suitable section to rewrite in the snippets, say 'Insufficient context for direct rewrite' instead of hallucinating.

For each suggestion:
1. BEFORE: [Verbatim Quote from Snippets]
2. AFTER: [Optimized Version]
3. GEO RATIONALE: Explain which metric this improves (e.g. 'Increases Entity Density' or 'Improves Answer Directness')."""
        
        return await self._generate_content(prompt)
