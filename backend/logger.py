import logging
import sys
import json
from datetime import datetime
from pydantic_settings import BaseSettings

# Using a hardcoded config fallback since we are trying not to import settings if it causes circular deps
LOG_LEVEL = logging.INFO

class JSONFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging."""
    def format(self, record):
        log_obj = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "funcName": record.funcName,
            "lineNo": record.lineno
        }
        
        # Include exc_info if present
        if record.exc_info:
            log_obj["exc_info"] = self.formatException(record.exc_info)
            
        return json.dumps(log_obj)

def setup_logger(name: str) -> logging.Logger:
    """Configures and returns a structured JSON logger."""
    logger = logging.getLogger(name)
    
    # Avoid attaching duplicate handlers if instantiated multiple times
    if not logger.handlers:
        logger.setLevel(LOG_LEVEL)
        
        # Console Handler
        console_handler = logging.StreamHandler(sys.stdout)
        
        # We can use standard formatter in development or JSON formatter in production
        # For our SaaS proof-of-concept, structured JSON is best practice
        formatter = JSONFormatter()
        console_handler.setFormatter(formatter)
        
        logger.addHandler(console_handler)
        
        # Prevent propagation to the root logger to avoid double-logging
        logger.propagate = False
        
    return logger

# Create a default overarching application logger
app_logger = setup_logger("geo_agent")
