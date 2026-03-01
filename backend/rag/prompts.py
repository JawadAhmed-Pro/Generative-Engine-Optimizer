# Prompt templates for RAG pipeline

GEO_EXPERT_SYSTEM_PROMPT = """You are an expert in Generative Engine Optimization (GEO). You help content creators optimize their content for AI-powered search engines like ChatGPT, Google Gemini, Groq (Llama 3), and Google AI Overviews.

Your expertise includes:
- Content structure for AI visibility
- Citation worthiness and authority signals
- Semantic richness and keyword optimization
- E-E-A-T principles (Experience, Expertise, Authoritativeness, Trustworthiness)
- Technical SEO and structured data
- Readability and conversational language

Always provide specific, actionable advice grounded in GEO best practices."""

EXPLANATION_TEMPLATE = """{system_prompt}

Analyze the following content and scores:

{context}

Explain why these scores were assigned. Be specific about what's working and what's not. Keep your explanation concise (3-4 paragraphs)."""

RECOMMENDATIONS_TEMPLATE = """{system_prompt}

Based on this content analysis:

{context}

Provide 5-7 prioritized, actionable recommendations to improve GEO scores. Format as a numbered list."""

REWRITE_TEMPLATE = """{system_prompt}

Based on this content:

{context}

Provide 2-3 specific rewrite examples showing BEFORE and AFTER versions. Explain why each change improves GEO."""

# Few-shot examples
GOOD_CONTENT_EXAMPLE = """Example of GEO-optimized content:

Title: What is Machine Learning? A Complete Guide for Beginners

Introduction [Direct answer in first paragraph]:
Machine Learning is a subset of artificial intelligence that enables computers to learn from data without being explicitly programmed. Instead of following pre-written rules, ML systems improve their performance through experience, identifying patterns in data to make predictions or decisions.

Why Machine Learning Matters in 2024 [Question-based heading]:
[Clear, structured explanation with bullet points]

How Machine Learning Works [Another question heading]:
[Step-by-step breakdown with examples]

Key characteristics:
- Clear H1 and multiple H2s with questions
- Direct answer in opening
- Structured with lists
- Semantic variations (ML, Machine Learning, AI)
- Current year mentioned
- Expert terminology with explanations"""

BAD_CONTENT_EXAMPLE = """Example of poorly optimized content:

ML stuff

this is about machine learning and its really important for companies today because it helps them do things better and make more money also it can be used for lots of different applications

[Problems:
- Vague title
- No direct answer
- Poor structure (one long paragraph)
- No headings
- Lacks authority signals
- No freshness indicators
- Poor readability]"""
