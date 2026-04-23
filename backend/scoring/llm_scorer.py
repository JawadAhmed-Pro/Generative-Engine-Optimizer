import aiohttp
import json
import asyncio
import re
import time
from typing import Dict, Any, List, Optional
from config import settings
from google import genai
from logger import app_logger

class LLMScorer:
    """LLM-powered scoring using Gemini API only."""
    
    def __init__(self):
        # Initialize API clients
        if settings.GEMINI_API_KEY:
            self.gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)
        else:
            self.gemini_client = None
        
        
        self.groq_api_key = settings.GROQ_API_KEY
    
    async def analyze(self, content: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform LLM-powered content analysis with high resilience.
        """
        # 1. Deterministic Slice for Intent Alignment (First 100 words)
        words = content.split()
        intent_slice = ' '.join(words[:100])
        content_sample = ' '.join(words[:3000]) if len(words) > 3000 else content
        
        content_type = metadata.get('content_type', 'general')
        query = metadata.get('target_keyword', 'General Topic')

        # 2. Parallel Resilience Pattern (Try Groq, fallback to Gemini)
        try:
            # We wrap the whole logic in a retry helper
            return await self._execute_with_retry(content_sample, intent_slice, query, metadata)
        except Exception as e:
            app_logger.error(f"All LLM Analysis attempts failed: {e}")
            return self._get_default_scores(content_type)

    async def _execute_with_retry(self, content: str, intent_slice: str, query: str, metadata: Dict[str, Any], retries: int = 2) -> Dict[str, Any]:
        for attempt in range(retries + 1):
            try:
                # Primary: Groq
                if self.groq_api_key:
                    return await self._analyze_with_groq(content, intent_slice, query, metadata)
                
                # Secondary: Gemini
                if hasattr(self, 'gemini_client') and self.gemini_client:
                    return await self._analyze_with_gemini(content, intent_slice, query, metadata)
            except Exception as e:
                if attempt == retries: raise e
                wait_time = (attempt + 1) * 2
                app_logger.warning(f"LLM attempt {attempt+1} failed, retrying in {wait_time}s... Error: {e}")
                await asyncio.sleep(wait_time)
        return self._get_default_scores(metadata.get('content_type', 'general'))

    async def optimize(self, content: str, mode: str, content_type: str) -> str:
        """
        Generate or Rewrite content to be GEO-optimized.
        Args:
            content: Source text or Topic idea
            mode: 'rewrite' or 'generate'
            content_type: 'general', 'ecommerce', etc.
        """
        prompt = self._create_optimization_prompt(content, mode, content_type)
        
        # Prefer Groq for generation if available as requested
        if self.groq_api_key:
            try:
                app_logger.debug("Using Groq for Content Generation...")
                return await self._generate_with_groq(prompt)
            except Exception as e:
                app_logger.error(f"Groq Generation Failed: {e}")

        # Fallback to Gemini
        if hasattr(self, 'gemini_client') and self.gemini_client:
            try:
                app_logger.debug("Using Gemini for Content Generation...")
                response = await self.gemini_client.aio.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=prompt
                )
                return response.text
            except Exception as e:
                app_logger.error(f"Gemini Generation Failed: {e}")
                
        return "Error: Could not generate content. Please check API keys."

    async def find_semantic_gaps(self, user_content: str, competitor_contents: List[str]) -> str:
        """Analyze gaps between user content and top competitors."""
        prompt = f"""
You are an expert Generative Engine Optimizer.
Run a "Semantic Gap Analysis" between the User's Content and the Top Ranking Competitors.

USER CONTENT:
{user_content[:2000]}

TOP COMPETITORS:
"""
        for i, comp in enumerate(competitor_contents):
            prompt += f"\n--- Competitor {i+1} ---\n{comp[:1500]}\n"

        prompt += """
Identify exactly what structural elements the user is missing that the competitors have. Focus on empirical differences like:
- Missing sections (e.g., pricing tables, technical specifications, comparisons)
- Missing trust signals (e.g., expert quotes, data blocks, FAQs)
- Missing sub-topics or questions answered that AI expects for 'Information Gain'.

Provide a concise, bulleted list of 2-4 Actionable "Missing Pieces".
Each bullet MUST clearly state: "Competitors have [X], but you do not."
Keep it brief, extremely direct, and highly actionable. No fluff.
"""
        if self.groq_api_key:
            try:
                app_logger.debug("Generating Semantic Gap Analysis via Groq...")
                return await self._generate_with_groq(prompt)
            except Exception as e:
                app_logger.error(f"Groq Gap Analysis Failed: {e}")

        if hasattr(self, 'gemini_client') and self.gemini_client:
            try:
                app_logger.debug("Generating Semantic Gap Analysis via Gemini...")
                response = await self.gemini_client.aio.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=prompt
                )
                return response.text
            except Exception as e:
                app_logger.error(f"Gemini Gap Analysis Failed: {e}")
                
        return "No significant structural gaps identified."

    async def generate_targeted_injection(self, context_text: str, injection_target: str, tone: str = "professional") -> str:
        """
        Generates a specific missing block (table, faq, paragraph) to fulfill a gap,
        matching the tone of the surrounding context.
        """
        prompt = f"""
You are a master structural copywriter. Your task is to generate a specific missing section for an article.
DO NOT rewrite the existing text. ONLY produce the new requested section in valid Markdown.

CONTEXT OF THE EXISTING ARTICLE (Use to match Topic & Tone):
{context_text[:2000]}

REQUESTED INJECTION / MISSING PIECE:
{injection_target}

TONE: {tone}

INSTRUCTIONS:
1. Generate the exact block requested (e.g. if requested a Pricing Table, build a Markdown Table).
2. Ensure the facts or structure aligns with typical AI extraction expectations (use clear headings, bullet points, or tables if applicable).
3. Output ONLY the new section content, no conversational preamble. DO NOT wrap it in ```markdown unless it is a code block. 
"""
        if self.groq_api_key:
            try:
                app_logger.debug("Generating targeted injection via Groq...")
                return await self._generate_with_groq(prompt)
            except Exception as e:
                app_logger.error(f"Groq Injection Failed: {e}")

        # Fallback to Gemini
        if hasattr(self, 'gemini_client') and self.gemini_client:
            try:
                app_logger.debug("Generating targeted injection via Gemini...")
                response = await self.gemini_client.aio.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=prompt
                )
                return response.text
            except Exception as e:
                app_logger.error(f"Gemini Injection Failed: {e}")
                
        return "> Injection generation failed. Check API connectivity."

    async def _generate_with_groq(self, prompt: str) -> str:
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.groq_api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": settings.GROQ_MODEL,
            "messages": [
                {"role": "system", "content": "You are an expert content editor optimized for AI Search Engines."},
                {"role": "user", "content": prompt}
            ]
        }
        def run_request():
            return requests.post(url, json=payload, headers=headers)
        response = await asyncio.to_thread(run_request)
        if response.status_code != 200:
            raise Exception(f"API Error {response.status_code}: {response.text}")
        return response.json()['choices'][0]['message']['content']

    def _create_optimization_prompt(self, content: str, mode: str, content_type: str) -> str:
        """Create a detailed prompt that aligns with GEO scoring metrics."""
        
        # This prompt is aligned with the 7 detailed metrics used in analysis:
        # 1. AI Friendly Formatting, 2. Structural Integrity, 3. Content Authority
        # 4. Internal Linkability, 5. Semantic Richness, 6. User Intent Alignment, 7. Readability UX
        
        geo_requirements = """
## MANDATORY GEO REQUIREMENTS (Your output will be scored on these exact criteria):

### 1. AI-FRIENDLY FORMATTING (Score: AI Visibility)
- Use clear Markdown with ## H2 and ### H3 headings
- Include at least 3-5 H2 sections and 2-3 H3 subsections
- Use bullet points and numbered lists extensively
- Add a **Key Takeaways** or **TL;DR** section at the start
- Include a comparison table if applicable

### 2. STRUCTURAL INTEGRITY (Score: AI Visibility)  
- Start with a direct answer to the main topic in the FIRST paragraph
- Follow inverted pyramid structure (most important info first)
- Each section should have a clear purpose
- Include transition sentences between sections

### 3. CONTENT AUTHORITY (Score: Citation Worthiness)
- Reference well-known industry standards, frameworks, or best practices BY NAME (e.g., "Google's E-E-A-T guidelines", "the SOLID principles")
- Mention REAL companies, tools, and technologies (e.g., "OpenAI's GPT-4", "LangChain framework", "ChromaDB")
- Use authoritative language patterns: "Industry experts recommend...", "Best practices suggest..."
- Include real, verifiable facts when you know them with certainty

### 4. INTERNAL LINKABILITY (Score: Citation Worthiness)
- Create content that can be referenced by AI
- Use definitive statements that AI can quote
- Include unique insights or frameworks
- Add memorable phrases or concepts

### 5. SEMANTIC RICHNESS (Score: Semantic Coverage)
- Use topic-related synonyms and variations
- Include long-tail keyword phrases naturally
- Cover related subtopics comprehensively
- Use both technical terms AND simple explanations

### 6. USER INTENT ALIGNMENT (Score: Semantic Coverage)
- Answer the "What, Why, How, When, Where" questions
- Use question-based headings (## Why is X important?)
- Address common user questions and objections
- Provide actionable next steps

### 7. READABILITY UX (Score: Technical Readability)
- Keep sentences under 25 words on average
- Use short paragraphs (2-4 sentences max)
- Bold important keywords and phrases
- Use active voice predominantly
- Aim for 8th-10th grade reading level

## AUTHORITY GUIDELINES:
 DO use REAL, verifiable references when you know them:
- Real company names: "Google", "OpenAI", "Microsoft"
- Real frameworks/tools: "LangChain", "Hugging Face", "TensorFlow"
- Real standards: "ISO 27001", "GDPR", "SOC 2"
- Real industry terms: "E-E-A-T", "RAG", "fine-tuning"

 DO use authoritative language when specific data isn't available:
- "Research suggests..." or "Studies indicate..."
- "Industry experts recommend..." or "Best practices suggest..."
- "Many organizations have found..." or "Leading companies report..."

 DO NOT invent fake specifics:
- No made-up percentages (e.g., "60% of users...")
- No fake study citations (e.g., "A 2024 Harvard study found...")
- No placeholder brackets (e.g., "[Company Name]")
- No fictional expert quotes
"""
        
        if mode == 'rewrite':
            return f"""You are a Generative Engine Optimization (GEO) Expert. Your task is to COMPLETELY REWRITE this content to maximize its visibility in AI Search Engines (ChatGPT, Gemini, Google AI Overview).

{geo_requirements}

## ORIGINAL CONTENT TO REWRITE:
{content}

## YOUR TASK:
Rewrite this content following ALL the requirements above. The rewritten version should:
1. Maintain the original topic and key points
2. Be significantly longer and more comprehensive (add 50-100% more content)
3. Have perfect Markdown structure with headers, lists, and formatting
4. Include specific data points, statistics, or authoritative references
5. Be immediately usable for blog posts or educational content

## OUTPUT FORMAT:
Return ONLY the optimized Markdown content. Do not include any preamble, explanation, or meta-commentary. Start directly with the content.
"""
        else:  # generate
            return f"""You are a Generative Engine Optimization (GEO) Expert. Your task is to GENERATE a comprehensive, high-ranking article that AI Search Engines will want to cite and reference.

{geo_requirements}

## TOPIC TO WRITE ABOUT:
{content}

## CONTENT TYPE: {content_type}

## YOUR TASK:
Generate a comprehensive article (1500-2500 words) following ALL the requirements above. The article should:
1. Start with a clear, direct answer in the first paragraph
2. Have at least 5-7 main sections with H2 headings
3. Include bullet points, numbered lists, and at least one table
4. Reference specific statistics or industry data
5. Include a Key Takeaways section and a conclusion
6. Be immediately publishable as a professional blog post

## OUTPUT FORMAT:
Return ONLY the Markdown content. Do not include any preamble, explanation, or meta-commentary. Start directly with the article title as # H1.
"""

    async def _analyze_with_groq(self, content: str, intent_slice: str, query: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze content using Groq API."""
        prompt = self._create_geo_prompt(content, intent_slice, query, metadata)
        
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.groq_api_key}",
            "Content-Type": "application/json"
        }
        
        # Groq requires messages format natively compatible with OpenAI
        payload = {
            "model": settings.GROQ_MODEL,
            "response_format": {"type": "json_object"},
            "messages": [
                {
                    "role": "system",
                    "content": "You are a precise GEO analysis engine. Return ONLY JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.1
        }
        
        def run_request():
            return requests.post(url, json=payload, headers=headers)
            
        response = await asyncio.to_thread(run_request)
        
        if response.status_code != 200:
            raise Exception(f"Groq API Error {response.status_code}: {response.text}")
            
        raw_result = response.json()
        response_text = raw_result['choices'][0]['message']['content']
        app_logger.debug(f"Groq Response (first 200 chars): {response_text[:200]}")
        return self._parse_llm_response(response_text, metadata.get('content_type', 'general'))

    async def _analyze_with_gemini(self, content: str, intent_slice: str, query: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze content using Gemini API (Async)."""
        prompt = self._create_geo_prompt(content, intent_slice, query, metadata)
        app_logger.debug(f"Calling Gemini API...")
        try:
            from google.genai import types
            # Standard generation using modern google-genai SDK
            response = await self.gemini_client.aio.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1
                )
            )
            app_logger.debug(f"Gemini responded. First 200 chars: {response.text[:200]}")
            return self._parse_llm_response(response.text, metadata.get('content_type', 'general'))
        except Exception as e:
            # Re-raise so the caller (analyze()) can log it and use the final fallback
            app_logger.error(f"Gemini API FAILED: {str(e)}")
            raise

    def _create_geo_prompt(self, content: str, intent_slice: str, query: str, metadata: Dict[str, Any]) -> str:
        """Create a prompt for GEO analysis based on content type."""
        title = metadata.get('title', 'Untitled')
        content_type = metadata.get('content_type', 'general')
        
        base_prompt = f"""
You are a Generative Engine Optimization (GEO) expert. Analyze this {content_type} content to see how well it ranks in AI Search Engines (ChatGPT, Perplexity, Gemini).

Title: {title}
Content Snippet:
{content}
"""

        if content_type == 'ecommerce':
            metrics_prompt = """
Evaluate the content on these specific 7 metrics (Scale 0-100) for E-COMMERCE:

1. **Product Data Completeness**: Detailed specs, dimensions, materials, and technical details.
2. **Review & Social Proof**: Presence of user reviews, ratings, or testimonials.
3. **Price & Availability**: Clear pricing, stock status, and formatting.
4. **CTA Clarity**: 'Add to Cart' or 'Buy Now' visibility and actionability.
5. **Inventory & Shipping**: Shipping times, costs, and return policy info.
6. **Visual Descriptions**: Use of descriptive language for images (Alt text context).
7. **Unique Value Prop**: Why buy THIS product? Comparison to alternatives.

Provide response in this EXACT JSON format:
{
    "product_data_completeness": <int>,
    "review_presence": <int>,
    "price_availability": <int>,
    "cta_clarity": <int>,
    "inventory_shipping": <int>,
    "visual_descriptions": <int>,
    "unique_value_prop": <int>,
    "explanation": "<summary string>",
    "suggestions": ["<impact_prefix>: <suggestion_string>", "..."]
}
"""
        else:
            # General / Educational / Blog (2025 Research Calibration)
            metrics_prompt = """
Evaluate the content based on 2025 Generative Engine Optimization (GEO) standards from Princeton, BrightEdge, and Ahrefs.
You are an OBJECTIVE AUDITOR. Grade fairly based on industry standards.

**GRADING SCALE:**
- **0-49 (Needs Improvement)**: Thin or unstructured content.
- **50-69 (Average)**: Good quality but lacks GEO specific optimizations.
- **70-85 (High Quality)**: Strong content, good structure, meets most intent.
- **86-100 (Exceptional)**: Perfect structure, highly cited, novel unique data.

**METRICS TO EVALUATE (2025 Standards):**

1. **Semantic Richness (Information Gain)**: Does it provide UNIQUE information, insights, or viewpoints?
2. **User Intent Alignment (Direct Answers)**: Is there a concise direct answer immediately following queries?
3. **Structural Integrity (Extraction Confidence)**: Ease of extraction for LLMs (lists, tables).
4. **AI-Friendly Formatting**: Headings and 'hard grounding' markers.
5. **Content Authority (Grounding Confidence)**: Density of verifiable facts/stats.
6. **E-E-A-T (Critical Calibration)**:
    - **Experience**: Look for "First-person grounding" (e.g., 'In my testing', original photos described, personal anecdotes). 
    - **Expertise**: Use of domain methodology and LSI terminology.
    - **Authoritativeness**: Signal of the source as a primary authority.
    - **Trustworthiness**: Absence of generic fluff; presence of safety warnings, citations, and data.
7. **Readability UX**: Clarity and lack of narrative 'fluff'.

Provide response in this EXACT JSON format:
{
    "semantic_richness": <int>,
    "user_intent_alignment": <int>,
    "structural_integrity": <int>,
    "ai_friendly_formatting": <int>,
    "content_authority": <int>,
    "internal_linkability": <int>,
    "readability_ux": <int>,
    "primary_intent": "Informational" | "Navigational" | "Transactional" | "Commercial Investigation",
    "experience_score": <int>,
    "expertise_score": <int>,
    "authoritativeness_score": <int>,
    "trustworthiness_score": <int>,
    "explanation": "<summary string>",
    "suggestions": ["<impact_prefix>: <suggestion_string>", "..."]
}
"""

        # Add Intent Alignment specific instruction
        intent_instruction = f"""
### INTENT ALIGNMENT GATE (Binary Check):
Evaluate ONLY this 100-word intro slice against the query "{query}":
"{intent_slice}"
Does it directly answer the user's intent? (Boolean).
"""
        return base_prompt + metrics_prompt + intent_instruction + "\n\nEvaluate objectively. Your 'suggestions' list MUST have 3-5 items. Each item MUST include an impact prefix like 'High Impact:', 'Medium Impact:', or 'Critical Impact:' based on the 2025 GEO research weights."

    def _extract_json(self, text: str) -> str:
        """Robustly extract JSON block from conversational LLM output."""
        # Try finding JSON block in markdown
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            return match.group(0)
        return text

    def _parse_llm_response(self, response_text: str, content_type: str) -> Dict[str, Any]:
        """Parse LLM response with high resilience."""
        try:
            json_str = self._extract_json(response_text)
            data = json.loads(json_str)
            return data
        except Exception as e:
            app_logger.error(f"Failed to parse LLM response: {e}")
            raise ValueError("Invalid JSON response from LLM")
    
    def _get_default_scores(self, content_type: str) -> Dict[str, Any]:
        """Return default scores checks."""
        defaults = {
            "semantic_richness": 50,
            "user_intent_alignment": 50,
            "structural_integrity": 50,
            "ai_friendly_formatting": 50,
            "content_authority": 50,
            "internal_linkability": 50,
            "readability_ux": 50,
            "primary_intent": "Informational",
            "experience_score": 50,
            "expertise_score": 50,
            "authoritativeness_score": 50,
            "trustworthiness_score": 50,
            "explanation": "Analysis failed. Using default scores.",
            "suggestions": ["Retry analysis."]
        }
        
        if content_type == 'ecommerce':
            defaults.update({
                "product_data_completeness": 50,
                "product_schema": 50,
                "review_presence": 50,
                "cta_clarity": 50,
                "inventory_shipping": 50
            })
            
        return defaults

    async def simulate_ai_response(self, query: str, content: str, domain: str = 'education') -> Dict[str, Any]:
        """Simulate how AI would respond to a query and check if user content would be cited."""
        
        # Step 1: Ask Groq the user's query
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.groq_api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": settings.GROQ_MODEL,
            "messages": [
                {"role": "user", "content": query}
            ],
            "temperature": 0.3,
            "max_tokens": 1000
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=headers, json=payload) as response:
                    if response.status == 200:
                        data = await response.json()
                        ai_response = data["choices"][0]["message"]["content"]
                    else:
                        ai_response = "Could not get AI response. Please try again."
        except Exception as e:
            ai_response = f"Error: {str(e)}"

        # Step 2: Analyze if user content would be cited
        analysis_prompt = f"""
You are an AI citation analyst. A user has content they want AI search engines to cite.

USER'S QUERY: {query}
DOMAIN: {domain}

USER'S CONTENT (what they want AI to cite):
{content[:2000]}

AI'S ACTUAL RESPONSE TO THE QUERY:
{ai_response}

TASK: Analyze whether the user's content would be cited by AI for this query.

Return JSON with:
{{
    "would_cite": true/false,
    "confidence": 0-100,
    "gaps": ["list of reasons why content might NOT be cited"],
    "suggestions": ["specific improvements to increase citation likelihood"]
}}

Base your analysis on:
1. Does user content directly answer the query?
2. Does it have specific facts, numbers, or unique insights?
3. Is it structured for AI readability (headings, lists)?
4. Does it have authority signals (citations, expertise)?

Return ONLY valid JSON, no other text.
"""

        try:
            payload = {
                "model": settings.GROQ_MODEL,
                "response_format": {"type": "json_object"},
                "messages": [
                    {"role": "user", "content": analysis_prompt}
                ],
                "temperature": 0.1,
                "max_tokens": 800
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=headers, json=payload) as response:
                    if response.status == 200:
                        data = await response.json()
                        analysis_text = data["choices"][0]["message"]["content"]
                        
                        # Parse JSON
                        import json
                        try:
                            # Clean response
                            analysis_text = analysis_text.strip()
                            if analysis_text.startswith("```"):
                                analysis_text = analysis_text.split("```")[1]
                                if analysis_text.startswith("json"):
                                    analysis_text = analysis_text[4:]
                            
                            analysis = json.loads(analysis_text)
                            return {
                                "would_cite": analysis.get("would_cite", False),
                                "confidence": analysis.get("confidence", 50),
                                "gaps": analysis.get("gaps", []),
                                "suggestions": analysis.get("suggestions", []),
                                "ai_response": ai_response
                            }
                        except json.JSONDecodeError:
                            pass
        except Exception as e:
            app_logger.error(f"Analysis error: {e}")
        
        # Default response if analysis fails
        return {
            "would_cite": False,
            "confidence": 30,
            "gaps": ["Could not complete full analysis"],
            "suggestions": ["Ensure content directly answers the query", "Add specific facts and numbers"],
            "ai_response": ai_response
        }

