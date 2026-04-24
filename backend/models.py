from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, JSON, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any

Base = declarative_base()


# SQLAlchemy Database Models
class User(Base):
    """User account model."""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")


class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # nullable for migration
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    owner = relationship("User", back_populates="projects")
    content_items = relationship("ContentItem", back_populates="project", cascade="all, delete-orphan")


class ContentItem(Base):
    __tablename__ = "content_items"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    url = Column(String, nullable=True)
    content = Column(Text, nullable=False)
    title = Column(String, nullable=True)
    content_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("Project", back_populates="content_items")
    analysis_results = relationship("AnalysisResult", back_populates="content_item", cascade="all, delete-orphan")
    insights = relationship("Insight", back_populates="content_item", cascade="all, delete-orphan")


class AnalysisResult(Base):
    __tablename__ = "analysis_results"
    
    id = Column(Integer, primary_key=True, index=True)
    content_item_id = Column(Integer, ForeignKey("content_items.id"))
    
    # Overall scores
    ai_visibility_score = Column(Float)
    citation_worthiness_score = Column(Float)
    semantic_coverage_score = Column(Float)
    technical_readability_score = Column(Float)
    
    # Detailed metrics (stored as JSON)
    rule_based_scores = Column(JSON)
    llm_scores = Column(JSON)
    suggestions = Column(JSON)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    content_item = relationship("ContentItem", back_populates="analysis_results")


class Insight(Base):
    __tablename__ = "insights"
    
    id = Column(Integer, primary_key=True, index=True)
    content_item_id = Column(Integer, ForeignKey("content_items.id"))
    insight_type = Column(String)  # 'explanation', 'recommendations', 'rewrite'
    content = Column(Text)  # The generated insight text
    created_at = Column(DateTime, default=datetime.utcnow)
    
    content_item = relationship("ContentItem", back_populates="insights")



class APILog(Base):
    __tablename__ = "api_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    endpoint = Column(String)
    method = Column(String)
    status_code = Column(Integer)
    latency_ms = Column(Float)
    tokens_used = Column(Integer, nullable=True)
    cost_usd = Column(Float, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)




class CompetitorComparison(Base):
    """Store competitor comparison results."""
    __tablename__ = "competitor_comparisons"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_url = Column(String, nullable=False)
    competitor_urls = Column(JSON, nullable=False)  # List of competitor URLs
    content_type = Column(String, default="general")
    user_overall_score = Column(Float, nullable=True)
    competitor_avg_score = Column(Float, nullable=True)
    comparison_results = Column(JSON, nullable=True)  # Full comparison JSON
    created_at = Column(DateTime, default=datetime.utcnow)


class AnalysisJob(Base):
    """Store background job status."""
    __tablename__ = "analysis_jobs"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Added for RLS
    job_type = Column(String, index=True) # e.g. "competitor_compare", "prompt_discovery"
    status = Column(String, default="pending") # "pending", "running", "completed", "failed"

    progress = Column(Integer, default=0)
    result = Column(JSON, nullable=True)
    error_message = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)


class ContentVersion(Base):
    """Store versions of optimized content."""
    __tablename__ = "content_versions"
    
    id = Column(Integer, primary_key=True, index=True)
    content_item_id = Column(Integer, ForeignKey("content_items.id"))
    content = Column(Text, nullable=False)
    version_label = Column(String, nullable=True) # e.g. "Authority Boost v1"
    created_at = Column(DateTime, default=datetime.utcnow)
    
    content_item = relationship("ContentItem")


# Pydantic Request/Response Models
class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None


class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ContentItemCreate(BaseModel):
    project_id: int
    url: Optional[str] = None
    content: Optional[str] = None


class ExtractContentRequest(BaseModel):
    url: str = Field(..., pattern=r'^https?://')
    target_keyword: Optional[str] = None
    project_id: Optional[int] = None


class ExtractKeywordsRequest(BaseModel):
    content: str
    target_keyword: Optional[str] = None
    project_id: Optional[int] = None


class AnalyzeURLRequest(BaseModel):
    url: str = Field(..., pattern=r'^https?://')
    project_id: Optional[int] = None
    content_type: str = Field(default="general", pattern=r'^(general|ecommerce|educational)$')
    target_keyword: Optional[str] = None
    engine: Optional[str] = Field(default="perplexity", pattern=r'^(perplexity|chatgpt|google_sge)$')


class AnalyzeTextRequest(BaseModel):
    content: str
    project_id: Optional[int] = None
    title: Optional[str] = None
    content_type: str = Field(default="general", pattern=r'^(general|ecommerce|educational)$')
    target_keyword: Optional[str] = None
    engine: Optional[str] = Field(default="perplexity", pattern=r'^(perplexity|chatgpt|google_sge)$')


class ScoreMetric(BaseModel):
    score: float = Field(..., ge=0, le=100)
    details: Dict[str, Any]
    suggestions: List[str]


class AnalysisResponse(BaseModel):
    content_item_id: Optional[int]
    ai_visibility_score: float
    citation_worthiness_score: float
    semantic_coverage_score: float
    technical_readability_score: float
    rule_based_scores: Dict[str, ScoreMetric]
    llm_scores: Dict[str, ScoreMetric]
    suggestions: List[Dict[str, Any]]
    intent_analysis: Optional[Dict[str, Any]] = None
    eeat_analysis: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    # Historical metadata
    score_delta: Optional[float] = 0.0
    previous_analyses_count: Optional[int] = 0


class InsightRequest(BaseModel):
    content_item_id: int
    insight_type: str = Field(..., pattern=r'^(explanation|recommendations|rewrite)$')


class InsightResponse(BaseModel):
    content_item_id: int
    insight_type: str
    insights: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class HistoryItem(BaseModel):
    id: int
    title: Optional[str]
    url: Optional[str]
    created_at: datetime
    score: float
    type: str  # 'url' or 'text'


class HistoryResponse(BaseModel):
    items: List[HistoryItem]


class OptimizeContentRequest(BaseModel):
    content: str
    content_item_id: Optional[int] = None
    mode: str = 'general' # 'rewrite', 'grounding', 'generate'
    strategy: str = 'general' # 'authority_boost', 'ai_answer', 'semantic_expansion', 'concise', 'technical'
    tone: str = 'professional' # 'professional', 'conversational', 'technical', 'persuasive'
    audience: str = 'intermediate' # 'beginner', 'intermediate', 'expert'
    strength: int = 50 # 1-100
    target_keyword: Optional[str] = None
    content_type: str = 'general'


class OptimizeRAGPayloadRequest(BaseModel):
    content: str
    target_keyword: str


class OptimizeEntitySchemaRequest(BaseModel):
    content: str


class GenerateSchemaRequest(BaseModel):
    content: str
    content_type: Optional[str] = None  # 'article', 'product', 'faq', 'howto', or None for auto-detect
    metadata: Optional[Dict[str, Any]] = None


class SimulateAIRequest(BaseModel):
    query: str
    content: str
    domain: str = 'education' # 'education' or 'ecommerce'


class PromptDiscoveryRequest(BaseModel):
    keyword: str
    target_keyword: Optional[str] = None # Alias for keyword if sent that way
    niche: Optional[str] = "general"


class InjectRequest(BaseModel):
    context_text: str
    injection_target: str
    tone: str = "professional"


class ValidateCitationRequest(BaseModel):
    content: str
    content_type: str = "general"


class DiagnosticMetrics(BaseModel):
    intent_match_score: float
    readability_score: float
    entity_coverage_pct: float
    content_depth_score: float
    redundancy_detection: List[str]
    geo_potential_score: float


# Authentication Schemas
class UserCreate(BaseModel):
    """Schema for user registration."""
    email: str = Field(..., min_length=5, max_length=100)
    password: str = Field(..., min_length=6, max_length=100)
    name: Optional[str] = Field(None, max_length=100)


class UserLogin(BaseModel):
    """Schema for user login."""
    email: str
    password: str


class UserResponse(BaseModel):
    """Schema for user response (no password)."""
    id: int
    email: str
    name: Optional[str]
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse



class CompetitorCompareRequest(BaseModel):
    """Request to compare against competitors."""
    user_url: str = Field(..., pattern=r'^https?://')
    competitor_urls: List[str] = Field(..., min_length=1, max_length=5)
    content_type: str = Field(default="general", pattern=r'^(general|ecommerce|educational)$')
    target_keyword: Optional[str] = None

