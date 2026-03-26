import os
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application configuration settings."""
    
    # API Keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    
    # Security
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "b39x_Y6c-vH!kL8#qR2zT5wP9fA1m@sN$")
    
    # Database Configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/geo_agent")
    
    # ChromaDB Configuration
    CHROMA_PERSIST_DIR: str = os.getenv("CHROMA_PERSIST_DIR", "./chroma_data")
    CHROMA_COLLECTION_NAME: str = "geo_content_v2"
    
    # Rate Limits
    MAX_REQUESTS_PER_MINUTE: int = 60
    MAX_TOKENS_PER_REQUEST: int = 8000
    
    # Model Selection
    GEMINI_MODEL: str = "gemini-2.5-flash"
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    
    # Chunking Configuration
    CHUNK_SIZE: int = 512
    CHUNK_OVERLAP: int = 50
    
    # Scoring Weights
    RULE_BASED_WEIGHT: float = 0.4
    LLM_WEIGHT: float = 0.6
    
    # CORS
    CORS_ORIGINS: list = [
        "https://geo-tool.site", 
        "https://www.geo-tool.site",
        "http://localhost:3000",
        "http://localhost:5173"
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
