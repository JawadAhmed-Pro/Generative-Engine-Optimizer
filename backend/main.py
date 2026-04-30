from fastapi import FastAPI, HTTPException, Depends, Request, Body
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager
import time
import logging
from datetime import datetime

from config import settings
from database import get_db, init_db, get_tenant_session, get_async_db

from jobs import job_manager
from sqlalchemy import select
from models import AnalysisJob

from models import (
    ProjectCreate, ProjectResponse, AnalyzeURLRequest, AnalyzeTextRequest,
    AnalysisResponse, InsightRequest, InsightResponse, Project, ContentItem, AnalysisResult, Insight, ContentVersion,
    HistoryResponse, HistoryItem, OptimizeContentRequest, SimulateAIRequest,
    User, UserCreate, UserLogin, UserResponse, Token,
    AnalyzeTextRequest, AnalyzeURLRequest, ExtractContentRequest, ExtractKeywordsRequest,
    GenerateSchemaRequest, InjectRequest, ValidateCitationRequest,
    CompetitorCompareRequest, CompetitorComparison, PromptDiscoveryRequest,
    OptimizeRAGPayloadRequest, OptimizeEntitySchemaRequest, DiagnosticMetrics,
    AutoFixRequest
)
import models
from content_fetcher import ContentFetcher
from chunker import ContentChunker
from vector_store import VectorStore
from scoring import RuleBasedScorer, LLMScorer, ScoreAggregator
from rag import RAGPipeline
from monitoring import MonitoringService
from competitor_analyzer import CompetitorAnalyzer
from probability_model import CitationProbabilityModel
from discovery_engine import PromptDiscoveryEngine
from geo_optimizer import geo_optimizer
from discovery_engine import PromptDiscoveryEngine
from auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_user, require_auth
)

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import bleach
from logger import app_logger

# Initialize Rate Limiter
limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup."""
    init_db()
    yield


# Create FastAPI app
app = FastAPI(
    title="GEO Agent API",
    description="Generative Engine Optimization Analysis API",
    version="1.0.0",
    lifespan=lifespan
)

# Setup Rate Limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Lazy Loading Service Container ---
class ServiceContainer:
    """Memory-efficient container that initializes services only when needed."""
    def __init__(self):
        self._content_fetcher = None
        self._chunker = None
        self._vector_store = None
        self._rule_scorer = None
        self._llm_scorer = None
        self._aggregator = None
        self._rag_pipeline = None
        self._probability_model = None
        self._discovery_engine = None
        self._competitor_analyzer = None

    @property
    def content_fetcher(self):
        if not self._content_fetcher: self._content_fetcher = ContentFetcher()
        return self._content_fetcher

    @property
    def chunker(self):
        if not self._chunker: self._chunker = ContentChunker()
        return self._chunker

    @property
    def vector_store(self):
        if not self._vector_store: self._vector_store = VectorStore()
        return self._vector_store

    @property
    def rule_scorer(self):
        if not self._rule_scorer: self._rule_scorer = RuleBasedScorer()
        return self._rule_scorer

    @property
    def llm_scorer(self):
        if not self._llm_scorer: self._llm_scorer = LLMScorer()
        return self._llm_scorer

    @property
    def aggregator(self):
        if not self._aggregator: self._aggregator = ScoreAggregator()
        return self._aggregator

    @property
    def rag_pipeline(self):
        if not self._rag_pipeline: self._rag_pipeline = RAGPipeline()
        return self._rag_pipeline

    @property
    def probability_model(self):
        if not self._probability_model: self._probability_model = CitationProbabilityModel()
        return self._probability_model

    @property
    def discovery_engine(self):
        if not self._discovery_engine: self._discovery_engine = PromptDiscoveryEngine()
        return self._discovery_engine

    @property
    def competitor_analyzer(self):
        if not self._competitor_analyzer:
            self._competitor_analyzer = CompetitorAnalyzer(
                content_fetcher=self.content_fetcher,
                rule_scorer=self.rule_scorer,
                llm_scorer=self.llm_scorer,
                aggregator=self.aggregator,
                discovery_engine=self.discovery_engine
            )
        return self._competitor_analyzer

# Global container instance
services = ServiceContainer()

# Use properties for backwards compatibility with existing route logic
# (Note: we use a helper to prevent accidental early instantiation)
def get_services():
    return services

# Configure internal logging for debugging
app_logger = logging.getLogger("geo_app")

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Custom handler to debug 422 errors by logging details to console."""
    error_details = exc.errors()
    app_logger.error(f"Validation Error Detail: {error_details}")
    return JSONResponse(
        status_code=422,
        content={
            "detail": error_details,
            "message": "Validation failed. Check 'detail' for the specific field error."
        },
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all for 500 errors to ensure CORS headers are present and log details."""
    app_logger.error(f"Global Exception: {str(exc)}")
    import traceback
    traceback.print_exc()
    
    # Extract origin for CORS response
    origin = request.headers.get("origin", "*")
    
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal Server Error",
            "detail": str(exc)
        },
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*"
        }
    )

@app.post("/api/extract-content")
async def extract_content_from_url(payload: ExtractContentRequest = Body(...)):
    """Extract raw content from a URL for the frontend editor."""
    try:
        # Use existing fetcher
        content_data = await services.content_fetcher.async_fetch_url(payload.url)
        return {
            "content": content_data['content'],
            "title": content_data.get('title', ''),
            "success": True
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch content: {str(e)}")


@app.get("/")
def root():
    """Root endpoint."""
    return {
        "message": "GEO Agent API",
        "version": "1.0.0",
        "endpoints": {
            "analyze_url": "/api/analyze-url",
            "analyze_text": "/api/analyze-text",
            "projects": "/api/projects",
            "insights": "/api/generate-insights"
        }
    }


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "vector_store": services.vector_store.get_collection_stats()
    }


# ========================
# LLM Diagnostic Endpoint (Debug only)
# ========================

@app.get("/api/debug-llm")
async def debug_llm():
    """Test Groq and Gemini API connections directly. Use to diagnose 50/100 default score issues."""
    import requests as req_lib

    results = {
        "groq_api_key_set": bool(settings.GROQ_API_KEY),
        "gemini_api_key_set": bool(settings.GEMINI_API_KEY),
        "groq_model": settings.GROQ_MODEL,
        "gemini_model": settings.GEMINI_MODEL,
        "groq_status": "not_tested",
        "groq_error": None,
        "groq_response_preview": None,
        "gemini_status": "not_tested",
        "gemini_error": None,
        "gemini_response_preview": None,
    }

    test_prompt = "Score this text: 'AI is great.' Return JSON: {\"semantic_richness\": 70}"

    # --- Test Groq ---
    if settings.GROQ_API_KEY:
        try:
            r = req_lib.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {settings.GROQ_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model": settings.GROQ_MODEL,
                    "response_format": {"type": "json_object"},
                    "messages": [{"role": "user", "content": test_prompt}],
                    "temperature": 0.1
                },
                timeout=20
            )
            if r.status_code == 200:
                results["groq_status"] = "success"
                results["groq_response_preview"] = r.json()["choices"][0]["message"]["content"][:200]
            else:
                results["groq_status"] = "http_error"
                results["groq_error"] = f"Status {r.status_code}: {r.text[:300]}"
        except Exception as e:
            results["groq_status"] = "exception"
            results["groq_error"] = str(e)
    else:
        results["groq_status"] = "skipped_no_key"

    # --- Test Gemini ---
    if settings.GEMINI_API_KEY:
        try:
            from google import genai
            from google.genai import types
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            response = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=test_prompt,
                config=types.GenerateContentConfig(response_mime_type="application/json", temperature=0.1)
            )
            results["gemini_status"] = "success"
            results["gemini_response_preview"] = response.text[:200]
        except Exception as e:
            results["gemini_status"] = "exception"
            results["gemini_error"] = str(e)
    else:
        results["gemini_status"] = "skipped_no_key"

    return results


# ========================
# Authentication Endpoints
# ========================

@app.post("/api/auth/register", response_model=Token)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if email exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        name=user_data.name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create token
    access_token = create_access_token(data={"sub": str(new_user.id), "email": new_user.email})
    
    return Token(
        access_token=access_token,
        user=UserResponse(
            id=new_user.id,
            email=new_user.email,
            name=new_user.name,
            is_active=new_user.is_active,
            created_at=new_user.created_at
        )
    )


@app.post("/api/auth/login", response_model=Token)
def login_user(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login and get access token."""
    # Find user
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Check if active
    if not user.is_active:
        raise HTTPException(status_code=401, detail="Account is disabled")
    
    # Create token
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    
    return Token(
        access_token=access_token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            is_active=user.is_active,
            created_at=user.created_at
        )
    )


@app.get("/api/auth/me", response_model=UserResponse)
def get_current_user_profile(
    current_user: dict = Depends(require_auth),
    db: Session = Depends(get_db)
):
    """Get current user's profile."""
    user = db.query(User).filter(User.id == current_user["id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics."""
    from sqlalchemy import func
    
    # Count URL analyses (content items with urls)
    urls_analyzed = db.query(ContentItem).filter(ContentItem.url.isnot(None)).count()
    
    # Count text optimizations (content items without urls)
    content_optimized = db.query(ContentItem).filter(ContentItem.url.is_(None)).count()
    
    # Calculate average score from analysis results
    avg_result = db.query(func.avg(
        (AnalysisResult.ai_visibility_score + 
         AnalysisResult.citation_worthiness_score + 
         AnalysisResult.semantic_coverage_score + 
         AnalysisResult.technical_readability_score) / 4
    )).scalar()
    
    avg_score = round(float(avg_result), 1) if avg_result else 0
    
    return {
        "urls_analyzed": urls_analyzed,
        "content_optimized": content_optimized,
        "avg_score": avg_score,
        "total_projects": db.query(Project).count()
    }


@app.get("/api/history")
def get_history(
    type: str = None, 
    limit: int = 10, 
    db: Session = Depends(get_tenant_session),
    current_user: dict = Depends(require_auth)
):
    """Get recent content items with their scores."""
    from sqlalchemy import or_

    # Include items that belong to user's projects OR have no project (direct text analysis)
    user_project_ids = [
        p.id for p in db.query(Project).filter(Project.user_id == current_user["id"]).all()
    ]

    query = db.query(ContentItem).filter(
        or_(
            ContentItem.project_id.in_(user_project_ids),
            ContentItem.user_id == current_user["id"]  # Direct ownership check for standalone items
        )
    )

    # Filter by type
    if type == "url":
        query = query.filter(ContentItem.url.isnot(None))
    elif type == "text":
        query = query.filter(ContentItem.url.is_(None))

    # Get recent items
    items = query.order_by(ContentItem.created_at.desc()).limit(limit).all()

    result = []
    for item in items:
        # Get latest analysis for this item
        analysis = db.query(AnalysisResult).filter(
            AnalysisResult.content_item_id == item.id
        ).order_by(AnalysisResult.created_at.desc()).first()

        score = None
        if analysis:
            scores = [
                analysis.ai_visibility_score,
                analysis.citation_worthiness_score,
                analysis.semantic_coverage_score,
                analysis.technical_readability_score
            ]
            valid_scores = [s for s in scores if s is not None]
            if valid_scores:
                score = sum(valid_scores) / len(valid_scores)

        result.append({
            "id": item.id,
            "title": item.title or (item.url[:50] if item.url else "Text Content"),
            "url": item.url,
            "type": "url" if item.url else "text",
            "score": round(score, 1) if score is not None else None,
            "created_at": item.created_at.isoformat(),
            "project_id": item.project_id
        })

    return {"items": result}


@app.delete("/api/history")
def clear_history(
    db: Session = Depends(get_tenant_session),
    current_user: dict = Depends(require_auth)
):
    """Clear all analysis history for the current user."""
    try:
        # Find all projects owned by the user
        projects = db.query(Project).filter(Project.user_id == current_user["id"]).all()
        project_ids = [p.id for p in projects]
        
        if not project_ids:
            return {"message": "No history to clear."}
            
        # Delete items matching the user's project IDs
        num_deleted = db.query(ContentItem).filter(ContentItem.project_id.in_(project_ids)).delete(synchronize_session=False)
        db.commit()
        return {"message": f"History cleared successfully. Removed {num_deleted} items."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# Project Management
@app.post("/api/projects", response_model=ProjectResponse)
def create_project(
    project: ProjectCreate, 
    db: Session = Depends(get_tenant_session),
    current_user: dict = Depends(require_auth)
):
    """Create a new project attached to user."""
    db_project = Project(
        name=project.name,
        description=project.description,
        user_id=current_user["id"]
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


@app.get("/api/projects", response_model=list[ProjectResponse])
def list_projects(
    db: Session = Depends(get_tenant_session),
    current_user: dict = Depends(require_auth)
):
    """List all projects for user."""
    projects = db.query(Project).filter(Project.user_id == current_user["id"]).all()
    # Default array instead of returning 404
    return projects or []


@app.get("/api/projects/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int, 
    db: Session = Depends(get_tenant_session),
    current_user: dict = Depends(require_auth)
):
    """Get a specific project."""
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user["id"]).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@app.delete("/api/projects/{project_id}")
def delete_project(
    project_id: int, 
    db: Session = Depends(get_tenant_session),
    current_user: dict = Depends(require_auth)
):
    """Delete a project."""
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user["id"]).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}


@app.delete("/api/projects")
def delete_all_projects(db: Session = Depends(get_db)):
    """Delete ALL projects."""
    try:
        num_deleted = db.query(Project).delete()
        db.commit()
        return {"message": f"All projects deleted successfully. Removed {num_deleted} projects."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/projects/{project_id}/items")
def get_project_items(
    project_id: int, 
    db: Session = Depends(get_tenant_session),
    current_user: dict = Depends(require_auth)
):
    """Get all content items for a project with their scores."""
    # Check project exists
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user["id"]).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get content items with latest analysis
    items = db.query(ContentItem).filter(ContentItem.project_id == project_id).all()
    
    result = []
    for item in items:
        # Get latest analysis result for this item
        latest = db.query(AnalysisResult).filter(
            AnalysisResult.content_item_id == item.id
        ).order_by(AnalysisResult.created_at.desc()).first()
        
        score = None
        if latest:
            score = (
                latest.citation_worthiness_score * 0.4 +
                latest.ai_visibility_score * 0.3 + 
                latest.semantic_coverage_score * 0.2 + 
                latest.technical_readability_score * 0.1
            )
        
        result.append({
            "id": item.id,
            "title": item.title,
            "url": item.url,
            "created_at": item.created_at.isoformat(),
            "score": score
        })
    
    return {"items": result}


@app.get("/api/analysis/{item_id}")
def get_analysis_by_item(
    item_id: int, 
    db: Session = Depends(get_tenant_session),
    current_user: dict = Depends(require_auth)
):
    """Get full analysis results for a content item."""
    from sqlalchemy import or_
    
    # Get content item and ensure ownership (either via project or directly)
    item = db.query(ContentItem).filter(
        ContentItem.id == item_id,
        or_(
            ContentItem.user_id == current_user["id"],
            db.query(Project).filter(Project.id == ContentItem.project_id, Project.user_id == current_user["id"]).exists()
        )
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Content item not found or access denied")
    
    # Get latest analysis
    analysis = db.query(AnalysisResult).filter(
        AnalysisResult.content_item_id == item_id
    ).order_by(AnalysisResult.created_at.desc()).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    # Calculate overall score (Weighted GEO Model)
    overall_score = (
        (analysis.citation_worthiness_score or 0) * 0.4 +
        (analysis.ai_visibility_score or 0) * 0.3 +
        (analysis.semantic_coverage_score or 0) * 0.2 +
        (analysis.technical_readability_score or 0) * 0.1
    )
    
    # Fetch stored insights
    stored_insights = db.query(Insight).filter(
        Insight.content_item_id == item_id
    ).order_by(Insight.created_at.desc()).all()
    
    insights_data = [
        {"type": i.insight_type, "content": i.content, "created_at": i.created_at.isoformat()}
        for i in stored_insights
    ]
    # Calculate Citation Probability
    probability_metrics = services.probability_model.calculate_probability(
        overall_score=overall_score,
        rule_scores=analysis.rule_based_scores or {},
        llm_scores=analysis.llm_scores or {},
        content_type=item.content_metadata.get('content_type', 'general') if item.content_metadata else "general"
    )

    # Get historical analyses for this content item
    history = db.query(AnalysisResult).filter(
        AnalysisResult.content_item_id == item_id
    ).order_by(AnalysisResult.created_at.asc()).all()
    
    historical_scores = [
        {
            "date": h.created_at.isoformat(),
            "score": (h.citation_worthiness_score * 0.4 + h.ai_visibility_score * 0.3 + h.semantic_coverage_score * 0.2 + h.technical_readability_score * 0.1)
        }
        for h in history
    ]

    # Calculate delta if there is history
    score_delta = 0
    if len(history) > 1:
        def get_weighted(h):
            return (
                (h.citation_worthiness_score or 0) * 0.4 +
                (h.ai_visibility_score or 0) * 0.3 +
                (h.semantic_coverage_score or 0) * 0.2 +
                (h.technical_readability_score or 0) * 0.1
            )
        oldest_score = get_weighted(history[0])
        newest_score = get_weighted(history[-1])
        score_delta = newest_score - oldest_score

    return {
        "id": item.id,
        "title": item.title,
        "url": item.url,
        "content": item.content,
        "created_at": item.created_at.isoformat(),
        "project_id": item.project_id,
        "analysis": {
            "overall_score": round(overall_score, 1),
            "ai_visibility_score": analysis.ai_visibility_score,
            "citation_worthiness_score": analysis.citation_worthiness_score,
            "semantic_coverage_score": analysis.semantic_coverage_score,
            "technical_readability_score": analysis.technical_readability_score,
            "llm_feedback": analysis.llm_scores.get('top_suggestion', '') if analysis.llm_scores else None,
            "rule_details": analysis.rule_based_scores,
            "recommendations": [s.get('text', str(s)) for s in (analysis.suggestions or [])[:8]],
            "suggestions_detailed": analysis.suggestions,
            "raw_content": item.content,
            "analyzed_at": analysis.created_at.isoformat(),
            "probability_metrics": probability_metrics,
            "historical_trend": historical_scores,
            "score_delta": round(score_delta, 1),
            "previous_analyses_count": len(history)
        },
        "insights": insights_data
    }


# Content Analysis
@app.post("/api/analyze-url", response_model=AnalysisResponse)
@limiter.limit("10/minute")
async def analyze_url(
    request: Request, 
    payload: AnalyzeURLRequest = Body(...), 
    db: Session = Depends(get_tenant_session),
    current_user: dict = Depends(require_auth)
):
    """Analyze content from a URL."""
    start_time = time.time()
    
    try:
        # Fetch content (Async)
        extracted = await services.content_fetcher.async_fetch_url(payload.url)
        
        # Check if URL already exists in this project
        content_item = db.query(ContentItem).filter(
            ContentItem.project_id == payload.project_id,
            ContentItem.url == payload.url
        ).first()

        content_type = getattr(payload, 'content_type', 'general') or 'general'

        if content_item:
            # Update existing item (Historical Tracking)
            content_item.content = extracted['content']
            content_item.title = extracted['title']
            
            # Preserve old metadata but update content_type
            meta = content_item.content_metadata or {}
            meta.update(extracted['metadata'])
            meta['content_type'] = content_type
            content_item.content_metadata = meta
        else:
            content_item = ContentItem(
                project_id=payload.project_id,
                user_id=current_user["id"],  # Track ownership
                url=payload.url,
                content=extracted['content'],
                title=extracted['title'],
                content_metadata=extracted['metadata']
            )
            db.add(content_item)
            
        db.commit()
        db.refresh(content_item)
        
        # Chunk and store in vector DB (optional - don't fail if this errors)
        try:
            chunks = services.chunker.chunk_content(
                extracted['content'],
                {
                    'title': extracted['title'],
                    'url': payload.url,
                    **extracted['metadata']
                }
            )
            services.vector_store.add_chunks(chunks, content_item.id)
        except Exception as e:
            print(f"Warning: Vector storage failed (this is OK): {str(e)}")
        
        # Perform analysis
        analysis = await perform_analysis(extracted['content'], extracted, db, content_item.id, engine=payload.engine)
        
        # Log metrics
        latency_ms = (time.time() - start_time) * 1000
        monitor = MonitoringService(db)
        monitor.log_request(
            endpoint="/api/analyze-url",
            method="POST",
            status_code=200,
            latency_ms=latency_ms
        )
        
        return analysis
        
    except Exception as e:
        # Check for scraping errors
        if "403" in str(e) or "Forbidden" in str(e):
            raise HTTPException(
                status_code=400, 
                detail="Designed Security: This website blocks automated access. Please copy the text and use the 'Check Text' tab instead."
            )
            
        # Log other errors
        import traceback
        traceback.print_exc()
        latency_ms = (time.time() - start_time) * 1000
        monitor = MonitoringService(db)
        monitor.log_request(
            endpoint="/api/analyze-url",
            method="POST",
            status_code=500,
            latency_ms=latency_ms,
            error_message=str(e)
        )
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post("/api/analyze-text", response_model=AnalysisResponse)
@limiter.limit("10/minute")
async def analyze_text(
    request: Request, 
    payload: AnalyzeTextRequest = Body(...), 
    db: Session = Depends(get_tenant_session),
    current_user: dict = Depends(require_auth)
):
    """Analyze direct text content."""
    start_time = time.time()
    
    try:
        # Sanitize text
        clean_content = bleach.clean(payload.content)
        clean_title = bleach.clean(payload.title) if payload.title else "Direct Text Input"

        # Create content item
        content_item = ContentItem(
            project_id=payload.project_id,
            user_id=current_user["id"], # Track ownership
            content=clean_content,
            title=clean_title,
            content_metadata={}
        )
        db.add(content_item)
        db.commit()
        db.refresh(content_item)
        
        # Chunk and store (optional)
        try:
            chunks = services.chunker.chunk_content(
                clean_content,
                {'title': clean_title}
            )
            services.vector_store.add_chunks(chunks, content_item.id)
        except Exception as e:
            print(f"Warning: Vector storage failed (this is OK): {str(e)}")
        
        # Perform analysis
        extracted = {
            'content': clean_content,
            'title': clean_title,
            'content_type': getattr(payload, 'content_type', 'general') or 'general',
            'metadata': {},
            'headings': {},
            'schema': {}
        }
        analysis = await perform_analysis(clean_content, extracted, db, content_item.id, engine=payload.engine)
        
        # Log metrics
        latency_ms = (time.time() - start_time) * 1000
        monitor = MonitoringService(db)
        monitor.log_request(
            endpoint="/api/analyze-text",
            method="POST",
            status_code=200,
            latency_ms=latency_ms
        )
        
        return analysis
        
    except Exception as e:
        latency_ms = (time.time() - start_time) * 1000
        monitor = MonitoringService(db)
        monitor.log_request(
            endpoint="/api/analyze-text",
            method="POST",
            status_code=500,
            latency_ms=latency_ms,
            error_message=str(e)
        )
        db.rollback() # Ensure transaction is cleared on error
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/optimize-content")
async def optimize_content(payload: OptimizeContentRequest = Body(...)):
    """Generate or Rewrite content with GEO 'Action Layer'."""
    try:
        if payload.mode == 'rewrite':
            result = await geo_optimizer.rewrite_to_inverted_pyramid(payload.content)
            return result
        elif payload.mode == 'grounding':
            result = await geo_optimizer.suggest_hard_grounding(payload.content, payload.content_type)
            return result
        else:
            optimized_text = await services.llm_scorer.optimize(
                content=payload.content,
                mode=payload.mode,
                content_type=payload.content_type
            )
            return {"optimized_content": optimized_text}
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/optimize/rag-payload")
async def optimize_rag_payload(payload: OptimizeRAGPayloadRequest = Body(...)):
    """Generate a hyper-dense AI Summary Box for RAG chunkers."""
    try:
        result = await geo_optimizer.generate_rag_payload(payload.content, payload.target_keyword)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/optimize/entity-schema")
async def optimize_entity_schema(payload: OptimizeEntitySchemaRequest = Body(...)):
    """Generate JSON-LD schema with specific entity anchoring."""
    try:
        result = await geo_optimizer.generate_entity_schema(payload.content)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/simulate-ai")
async def simulate_ai(payload: SimulateAIRequest = Body(...)):
    """Simulate AI perception - test if AI would cite user content."""
    try:
        result = await services.llm_scorer.simulate_ai_response(
            query=payload.query,
            content=payload.content,
            domain=payload.domain
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/optimize")
async def optimize_full_content(payload: OptimizeContentRequest = Body(...)):
    """Deep optimization using section-by-section rewrite engine."""
    try:
        from geo_optimizer import geo_optimizer
        result = await geo_optimizer.rewrite(
            content=payload.content,
            strategy=payload.strategy,
            tone=payload.tone,
            audience=payload.audience,
            strength=payload.strength,
            target_query=payload.target_keyword
        )
        return result
    except Exception as e:
        app_logger.error(f"Optimization failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/api/semantic-search")
def semantic_search(query: str, limit: int = 5, content_item_id: int = None):
    """
    Search for semantically similar content using ChromaDB vectors.
    
    Args:
        query: Search query text
        limit: Maximum number of results (default 5)
        content_item_id: Optional filter to search within specific content
        
    Returns:
        List of similar content chunks with metadata and similarity scores
    """
    try:
        results = services.vector_store.similarity_search(
            query=query,
            content_item_id=content_item_id,
            n_results=limit
        )
        
        # Format response
        formatted_results = []
        for result in results:
            formatted_results.append({
                "content": result.get('content', '')[:500],  # Limit content size
                "metadata": result.get('metadata', {}),
                "similarity_score": 1 - result.get('distance', 0) if result.get('distance') else None
            })
        
        return {
            "query": query,
            "results": formatted_results,
            "total_found": len(formatted_results)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Semantic search failed: {str(e)}")


@app.get("/api/vector-stats")
def get_vector_stats():
    """Get ChromaDB vector store statistics."""
    try:
        stats = services.vector_store.get_collection_stats()
        return {
            "status": "connected",
            **stats
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }


# Schema Generator
from schema_generator import schema_generator
from pydantic import BaseModel
from typing import Optional, Dict, Any


@app.post("/api/generate-schema")
def generate_schema(payload: GenerateSchemaRequest = Body(...)):
    """
    Generate JSON-LD Schema.org markup for content.
    
    Args:
        payload: Content and metadata for schema generation
        
    Returns:
        schema_type: The detected/used schema type
        json_ld: The JSON-LD object
        html_snippet: Ready-to-use HTML script tag
    """
    try:
        # Detected type or auto-detect
        if not payload.content_type:
            detected_type = schema_generator.detect_schema_type(payload.content, payload.metadata)
        else:
            detected_type = payload.content_type
        
        # Generate schema
        result = schema_generator.generate_schema(
            content=payload.content,
            content_type=detected_type,
            metadata=payload.metadata or {}
        )
        
        return {
            "success": True,
            "detected_type": detected_type,
            **result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Schema generation failed: {str(e)}")


@app.post("/api/extract-keywords")
async def extract_keywords(payload: ExtractKeywordsRequest = Body(...)):
    """
    Extract target keywords from content using LLM.
    
    Returns:
        primary_keyword: The main topic/keyword
        secondary_keywords: Related keywords and phrases
        long_tail_keywords: Question-based long-tail variations
    """
    try:
        from google import genai
        from config import settings
        
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        
        prompt = f"""Analyze this content and extract SEO target keywords.

Content:
{payload.content[:3000]}

Content Type: {payload.content_type if hasattr(payload, 'content_type') else 'general'}

Return a JSON object with:
1. "primary_keyword": The single main keyword/phrase this content should rank for (3-5 words max)
2. "secondary_keywords": Array of 3-5 related keywords/phrases
3. "long_tail_keywords": Array of 2-3 question-based search queries users might ask

Example output:
{{
    "primary_keyword": "best laptops 2024",
    "secondary_keywords": ["laptop buying guide", "gaming laptop reviews", "budget laptops"],
    "long_tail_keywords": ["what is the best laptop for students", "how to choose a laptop"]
}}

Return ONLY the JSON object, no other text."""

        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt
        )
        result_text = response.text.strip()
        
        # Parse JSON from response
        import json
        import re
        
        # Extract JSON from response (handle markdown code blocks)
        json_match = re.search(r'\{[\s\S]*\}', result_text)
        if json_match:
            keywords = json.loads(json_match.group())
        else:
            keywords = {
                "primary_keyword": "content optimization",
                "secondary_keywords": ["SEO tips", "content strategy"],
                "long_tail_keywords": ["how to optimize content"]
            }
        
        return {
            "success": True,
            **keywords
        }
    except Exception as e:
        # Fallback keywords
        return {
            "success": False,
            "error": str(e),
            "primary_keyword": "",
            "secondary_keywords": [],
            "long_tail_keywords": []
        }


async def perform_analysis(content: str, extracted: dict, db: Session, content_item_id: int, engine: str = "perplexity") -> AnalysisResponse:
    """Perform complete GEO analysis."""
    # Rule-based scoring
    rule_scores = services.rule_scorer.analyze(content, extracted, extracted.get('content_type', 'general'))
    
    # LLM scoring (Async)
    llm_scores = await services.llm_scorer.analyze(content, extracted)
    
    # Aggregate scores
    final_scores = services.aggregator.aggregate(rule_scores, llm_scores)
    
    # Add context for probability auto-detection
    detection_context = final_scores['llm_scores'].copy()
    detection_context['raw_content'] = content
    detection_context['target_keyword'] = extracted.get('target_keyword', '')

    # Calculate initial probability baseline (using dynamically weighted overall score)
    current_overall = final_scores.get('overall_visibility_score', 0)
    
    prob_calc = services.probability_model.calculate_probability(
        overall_score=current_overall,
        rule_scores=final_scores['rule_based_scores'],
        llm_scores=detection_context,
        content_type=extracted.get('content_type', 'general'),
        engine=engine
    )
    
    # ---------------------------------------------------------
    # FIX 2: Live Validation Reduction (1 Query Only)
    # ---------------------------------------------------------
    from live_verifier import live_verifier
    
    target_kw = extracted.get('target_keyword', 'the topic')
    if not target_kw:
         target_kw = "the topic"
    
    # Run Live Verification for 1 target keyword only
    predicted_anchor = prob_calc.get('probability', 60.0)
    live_results = await live_verifier.verify_citations(url=extracted.get('url', ''), queries=[target_kw], predicted_score=predicted_anchor)
    actual_rate = live_results["actual_citation_rate"]
    
    # NEW: Grounding Audit (Identify missing stats/facts)
    # Optimization: Use global singleton geo_optimizer instead of re-instantiating (prevents duplicate spacy loads)
    grounding_audit = await geo_optimizer.suggest_hard_grounding(content, extracted.get('content_type', 'general'))
    missing_citations = grounding_audit.get('suggestions', [])
    
    if isinstance(missing_citations, str):
        missing_citations = [missing_citations]
    elif not isinstance(missing_citations, list):
        missing_citations = []
    
    predicted_score = prob_calc.get('probability', 0.0)
    error_gap = predicted_score - actual_rate
    
    prob_calc['validation_layer'] = {
        "queries_tested": [target_kw],
        "total_checks": 1,
        "citation_status": "Cited" if actual_rate > 0 else "Not Cited",
        "snapshot_label": "Point-in-time snapshot — results vary per query",
        "error_gap": round(error_gap, 1),
        "status": "Validated" if abs(error_gap) <= 15 else "High Variance"
    }
    
    final_scores['llm_scores']['probability_metrics'] = {
        'score': predicted_score,
        'details': prob_calc,
        'suggestions': []
    }
    # Save results to database
    analysis_result = AnalysisResult(
        content_item_id=content_item_id,
        structural_clarity_score=final_scores['structural_clarity_score'],
        citation_worthiness_score=final_scores['citation_worthiness_score'],
        semantic_coverage_score=final_scores['semantic_coverage_score'],
        freshness_authority_score=final_scores['freshness_authority_score'],
        rule_based_scores=final_scores['rule_based_scores'],
        llm_scores=final_scores['llm_scores'],
        suggestions=final_scores['suggestions']
    )
    db.add(analysis_result)
    db.commit()
    
    # Fetch history to calculate delta for the response
    history = db.query(AnalysisResult).filter(
        AnalysisResult.content_item_id == content_item_id
    ).order_by(AnalysisResult.created_at.asc()).all()
    
    score_delta = 0
    newest_score = current_overall # Default fallback for first-time analysis
    
    if len(history) > 1:
        # Null-safe calculation for historical scores (25% weight each)
        h0_str = history[0].structural_clarity_score or 0
        h0_cit = history[0].citation_worthiness_score or 0
        h0_sem = history[0].semantic_coverage_score or 0
        h0_frh = history[0].freshness_authority_score or 0
        
        h_last_str = history[-1].structural_clarity_score or 0
        h_last_cit = history[-1].citation_worthiness_score or 0
        h_last_sem = history[-1].semantic_coverage_score or 0
        h_last_frh = history[-1].freshness_authority_score or 0

        oldest_score = (h0_str * 0.25 + h0_cit * 0.25 + h0_sem * 0.25 + h0_frh * 0.25)
        newest_score = (h_last_str * 0.25 + h_last_cit * 0.25 + h_last_sem * 0.25 + h_last_frh * 0.25)
        score_delta = newest_score - oldest_score

    # Create response
    response = AnalysisResponse(
        content_item_id=content_item_id,
        overall_score=round(newest_score if len(history) > 0 else current_overall, 1),
        structural_clarity_score=final_scores['structural_clarity_score'],
        citation_worthiness_score=final_scores['citation_worthiness_score'],
        semantic_coverage_score=final_scores['semantic_coverage_score'],
        freshness_authority_score=final_scores['freshness_authority_score'],
        structural_score=final_scores['llm_scores'].get('structural_clarity'),
        semantic_score=final_scores['llm_scores'].get('semantic_coverage'),
        probability_metrics=prob_calc,
        missing_citations=missing_citations,
        rule_based_scores=final_scores['rule_based_scores'],
        llm_scores=final_scores['llm_scores'],
        suggestions=final_scores['suggestions'],
        timestamp=datetime.utcnow(),
        raw_content=content,
        score_delta=round(score_delta, 1),
        previous_analyses_count=len(history),
        benchmark_version=settings.GEO_BENCHMARK_VERSION,
        analysis_disclaimer="Citation status is a snapshot sampled at this moment. AI engine citations are non-deterministic and change with every query."
    )
    
    return response


# RAG Insights
@app.post("/api/generate-insights", response_model=InsightResponse)
async def generate_insights(payload: InsightRequest = Body(...), db: Session = Depends(get_db)):
    """Generate RAG-powered insights."""
    # Get content item and analysis
    content_item = db.query(ContentItem).filter(ContentItem.id == payload.content_item_id).first()
    if not content_item:
        raise HTTPException(status_code=404, detail="Content item not found")
    
    analysis = db.query(AnalysisResult).filter(
        AnalysisResult.content_item_id == payload.content_item_id
    ).order_by(AnalysisResult.created_at.desc()).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found. Run analysis first.")
    
    # Prepare analysis results
    analysis_dict = {
        'ai_visibility_score': analysis.ai_visibility_score,
        'citation_worthiness_score': analysis.citation_worthiness_score,
        'semantic_coverage_score': analysis.semantic_coverage_score,
        'technical_readability_score': analysis.technical_readability_score
    }
    
    # Generate insights
    insights = await services.rag_pipeline.generate_insights(
        payload.content_item_id,
        payload.insight_type,
        analysis_dict
    )
    
    # Save insight to DB
    new_insight = Insight(
        content_item_id=payload.content_item_id,
        insight_type=payload.insight_type,
        content=insights
    )
    db.add(new_insight)
    db.commit()
    
    return InsightResponse(
        content_item_id=payload.content_item_id,
        insight_type=payload.insight_type,
        insights=insights,
        timestamp=datetime.utcnow()
    )


@app.post("/api/reset")
def factory_reset(db: Session = Depends(get_db)):
    """Factory Reset: Wipe all data."""
    try:
        # Delete in order of dependencies
        db.query(AnalysisResult).delete()
        db.query(ContentItem).delete()
        db.query(Project).delete()
        # Optionally delete users? For now let's keep users to avoid locking them out immediately without warning
        # db.query(User).delete() 
        
        db.commit()
        
        # Also clear vector store
        try:
            services.vector_store.client.reset() 
        except:
            pass # Chroma reset might not be available or needed depending on version
            
        return {"message": "Factory reset complete. All data cleared."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))



# ========================
# Competitor Analysis
# ========================

async def _run_competitor_comparison(user_url, competitor_urls, keyword, niche, content_type, user_id):
    from database import AsyncSessionLocal
    results = await services.competitor_analyzer.compare(
        user_url=user_url,
        competitor_urls=competitor_urls,
        keyword=keyword,
        niche=niche,
        content_type=content_type
    )

    async with AsyncSessionLocal() as db:
        comparison = CompetitorComparison(
            user_id=user_id,
            user_url=user_url,
            competitor_urls=competitor_urls,
            content_type=content_type,
            user_overall_score=results["user"]["scores"]["overall"],
            competitor_avg_score=results["comparison"].get("competitor_avg_overall", 0),
            comparison_results=results
        )
        db.add(comparison)
        await db.commit()
        await db.refresh(comparison)
        results["comparison_id"] = comparison.id
        
    return results


@app.post("/api/competitor-compare")
@limiter.limit("5/minute")
async def compare_competitors(
    request: Request,
    payload: CompetitorCompareRequest = Body(...), 
    current_user: dict = Depends(require_auth)
):
    """Dispatch competitor comparison to background job."""
    from database import AsyncSessionLocal
    
    keyword = payload.target_keyword if payload.target_keyword else None
    try:
        job_id = await job_manager.submit_job(
            AsyncSessionLocal,
            "competitor_compare",
            current_user["id"],
            _run_competitor_comparison,
            user_url=payload.user_url,
            competitor_urls=payload.competitor_urls,
            keyword=keyword,
            niche=payload.niche,
            content_type=payload.content_type
        )
        return {"status": "pending", "job_id": job_id, "message": "Competitor analysis started"}
    except Exception as e:
        app_logger.error(f"Job dispatch failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/jobs/{job_id}")
async def get_job_status(job_id: str):
    """Poll for background job status."""
    from database import AsyncSessionLocal
    
    async with AsyncSessionLocal() as db:
        job = (await db.execute(select(AnalysisJob).filter(AnalysisJob.id == job_id))).scalars().first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        return {
            "job_id": job.id,
            "status": job.status,
            "progress": job.progress,
            "result": job.result,
            "error": job.error_message,
            "completed_at": job.completed_at
        }


@app.get("/api/competitor-history")
def get_competitor_history(
    limit: int = 10, 
    db: Session = Depends(get_tenant_session),
    current_user: dict = Depends(require_auth)
):
    """Get competitor comparison history."""
    items = db.query(CompetitorComparison).filter(
        CompetitorComparison.user_id == current_user["id"]
    ).order_by(
        CompetitorComparison.created_at.desc()
    ).limit(limit).all()
    
    return {
        "items": [
            {
                "id": item.id,
                "user_url": item.user_url,
                "competitor_urls": item.competitor_urls,
                "content_type": item.content_type,
                "user_overall_score": item.user_overall_score,
                "competitor_avg_score": item.competitor_avg_score,
                "created_at": item.created_at.isoformat()
            }
            for item in items
        ]
    }


@app.get("/api/competitor-compare/{comparison_id}")
def get_comparison_detail(
    comparison_id: int, 
    db: Session = Depends(get_tenant_session),
    current_user: dict = Depends(require_auth)
):
    """Get detailed comparison results."""
    comparison = db.query(CompetitorComparison).filter(
        CompetitorComparison.id == comparison_id,
        CompetitorComparison.user_id == current_user["id"]
    ).first()
    if not comparison:
        raise HTTPException(status_code=404, detail="Comparison not found or access denied")
    return comparison.comparison_results


# ========================
# Content Strategy / Discovery
# ========================

class AutoFixRequest(BaseModel):
    content_item_id: Optional[int] = None
    content: Optional[str] = None
    suggestion: str
    strategy: Optional[str] = 'general'
    tone: Optional[str] = 'professional'

@app.post("/api/auto-fix")
async def auto_fix_content(
    payload: AutoFixRequest = Body(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_auth)
):
    """Applies a 'One-Click Fix' to content using LLM."""
    try:
        # Get content (either from DB or from direct payload)
        if payload.content_item_id:
            content_item = db.query(ContentItem).filter(ContentItem.id == payload.content_item_id).first()
            if not content_item:
                raise HTTPException(status_code=404, detail="Content not found")
            content_to_fix = content_item.content
        elif payload.content:
            content_to_fix = payload.content
        else:
            raise HTTPException(status_code=400, detail="Either content_item_id or content must be provided")
            
        from geo_optimizer import geo_optimizer
        result = await geo_optimizer.auto_fix(
            content_to_fix, 
            payload.suggestion,
            strategy=getattr(payload, 'strategy', 'general'),
            tone=getattr(payload, 'tone', 'professional')
        )
        
        # Save version only if we have a content_item_id
        if payload.content_item_id:
            new_version = ContentVersion(
                content_item_id=payload.content_item_id,
                content=result["optimized_content"],
                version_label=f"Auto-Fix: {payload.suggestion[:30]}..."
            )
            db.add(new_version)
            db.commit()
        
        return result
    except Exception as e:
        db.rollback() # Ensure transaction is cleared on error
        app_logger.error(f"Auto Fix Failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze-diagnostics", response_model=DiagnosticMetrics)
async def analyze_diagnostics(
    payload: Dict[str, str] = Body(...),
    current_user: dict = Depends(require_auth)
):
    """Real-time diagnostic layer for the optimization workbench."""
    try:
        content = payload.get("content", "")
        if not content:
            raise HTTPException(status_code=400, detail="Content is required")
            
        from geo_optimizer import geo_optimizer
        diagnostics = await geo_optimizer.get_diagnostics(content)
        return diagnostics
    except Exception as e:
        app_logger.error(f"Diagnostics Failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


class SnippetOptimizeRequest(BaseModel):
    snippet: str
    full_context: str
    action: str # 'expand', 'simplify', 'authoritative', 'answer_format'

@app.post("/api/optimize-snippet")
async def optimize_snippet(
    payload: SnippetOptimizeRequest = Body(...),
    current_user: dict = Depends(require_auth)
):
    """Surgical optimization for a selected text block."""
    try:
        from geo_optimizer import geo_optimizer
        result = await geo_optimizer.optimize_snippet(
            payload.snippet, 
            payload.full_context, 
            payload.action
        )
        return result
    except Exception as e:
        app_logger.error(f"Snippet Optimization Failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/content-versions/{content_item_id}")
async def get_content_versions(
    content_item_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_auth)
):
    """Retrieve version history for a content item."""
    versions = db.query(ContentVersion).filter(
        ContentVersion.content_item_id == content_item_id
    ).order_by(ContentVersion.created_at.desc()).all()
    
    return [
        {
            "id": v.id,
            "content": v.content,
            "version_label": v.version_label,
            "created_at": v.created_at.isoformat()
        }
        for v in versions
    ]


class PromptDiscoveryRequest(BaseModel):
    keyword: str
    niche: Optional[str] = "general"

async def _run_discover_prompts(keyword, niche):
    if len(keyword.split()) <= 2:
        # generate_niche_library returns a LIST of prompt dicts
        raw = await services.discovery_engine.generate_niche_library(keyword)
        prompts_list = raw if isinstance(raw, list) else raw.get("top_prompts", [])
    else:
        # discover_prompts returns a DICT with "top_prompts" key
        raw = await services.discovery_engine.discover_prompts(
            keyword=keyword,
            niche=niche
        )
        prompts_list = raw.get("top_prompts", []) if isinstance(raw, dict) else raw

    # Normalize each prompt to ensure consistent fields for the frontend
    normalized = []
    for p in prompts_list:
        if not isinstance(p, dict):
            continue
        normalized.append({
            "prompt": p.get("prompt", ""),
            "intent": p.get("intent", "informational"),
            "search_volume_estimate": p.get("search_volume_estimate", _score_to_volume(p.get("value_score"))),
            "content_gap": p.get("content_gap", "No gap analysis available."),
            "value_score": p.get("value_score", 50),
            "source_signal": p.get("source_signal", "Synthesized"),
        })

    return {
        "success": True,
        "keyword": keyword,
        "niche": niche,
        "data": raw,
        "prompts": normalized
    }


def _score_to_volume(score):
    """Convert a numeric value_score to a volume label for display."""
    if score is None:
        return "medium"
    if score >= 70:
        return "high"
    if score >= 40:
        return "medium"
    return "low"

@app.post("/api/discover-prompts")
async def discover_prompts(
    payload: PromptDiscoveryRequest = Body(...),
    current_user: dict = Depends(require_auth)
):
    """Discovery Engine: Discover prompts for a keyword/niche."""
    from database import AsyncSessionLocal
    try:
        job_id = await job_manager.submit_job(
            AsyncSessionLocal,
            "prompt_discovery",
            current_user["id"],
            _run_discover_prompts,
            keyword=payload.keyword,
            niche=payload.niche
        )
        return {"status": "pending", "job_id": job_id, "message": "Discovery started"}
    except Exception as e:
        app_logger.error(f"Discovery Failed: {e}")
        raise HTTPException(status_code=500, detail=f"Prompt discovery failed: {str(e)}")


@app.post("/api/discover/competitors")
async def discover_competitors(
    payload: PromptDiscoveryRequest = Body(...),
    current_user: dict = Depends(require_auth)
):
    """Discovery Engine: Find top competitor URLs for a keyword."""
    try:
        from search_service import SearchService
        search_service = SearchService()
        competitors = search_service.get_top_competitors(payload.keyword)
        
        return {
            "success": True,
            "keyword": payload.keyword,
            "competitors": competitors,
            "message": "Competitors discovered successfully" if competitors else "No competitors found for this keyword."
        }
    except Exception as e:
        app_logger.error(f"Competitor Discovery Failed: {e}")
        raise HTTPException(status_code=500, detail=f"Competitor discovery failed: {str(e)}")

@app.post("/api/optimize/inject")
async def generate_targeted_injection(
    payload: InjectRequest = Body(...),
    current_user: dict = Depends(require_auth)
):
    """Generate a specific missing block for the Smart Injection Auto-Writer."""
    try:
        injected_markdown = await services.llm_scorer.generate_targeted_injection(
            context_text=payload.context_text,
            injection_target=payload.injection_target,
            tone=payload.tone
        )
        return {"status": "success", "injection": injected_markdown}
    except Exception as e:
        app_logger.error(f"Targeted Injection Failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Injection generation failed.")

@app.post("/api/validate-citation")
async def validate_citation(
    payload: ValidateCitationRequest = Body(...),
    current_user: dict = Depends(require_auth)
):
    """Run a live simulation to determine if the content crosses the 'Extraction Threshold'."""
    try:
        # Full pseudo-analysis for validation
        extracted = {'content': payload.content, 'content_type': payload.content_type}
        rule_scores = services.rule_scorer.analyze(payload.content, extracted, payload.content_type)
        llm_scores_res = await services.llm_scorer.analyze(payload.content, extracted)
        final_scores = services.aggregator.aggregate(rule_scores, llm_scores_res)
        
        overall_score = (
            final_scores['citation_worthiness_score'] * 0.4 +
            final_scores['ai_visibility_score'] * 0.3 + 
            final_scores['semantic_coverage_score'] * 0.2 + 
            final_scores['technical_readability_score'] * 0.1
        )
        
        # Cross-reference with probability model
        prob_calc = services.probability_model.calculate_probability(
            overall_score=overall_score,
            rule_scores=final_scores['rule_based_scores'],
            llm_scores=final_scores['llm_scores'],
            content_type=payload.content_type,
            engine="perplexity"
        )
        
        # Determine Success 
        threshold_met = prob_calc.get('probability', 0) >= 80.0
        
        return {
            "status": "success",
            "threshold_met": threshold_met,
            "probability": prob_calc.get('probability', 0),
            "simulated_score": overall_score,
            "validation_factors": prob_calc.get('factors', [])
        }
    except Exception as e:
        app_logger.error(f"Validation Engine Failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Validation failed.")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
