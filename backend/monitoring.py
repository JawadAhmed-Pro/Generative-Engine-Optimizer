from datetime import datetime
from typing import Dict, Any
from sqlalchemy.orm import Session
from models import APILog


class MonitoringService:
    """Service for logging and monitoring API usage."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def log_request(
        self,
        endpoint: str,
        method: str,
        status_code: int,
        latency_ms: float,
        tokens_used: int = None,
        cost_usd: float = None,
        error_message: str = None
    ):
        """Log an API request."""
        log_entry = APILog(
            endpoint=endpoint,
            method=method,
            status_code=status_code,
            latency_ms=latency_ms,
            tokens_used=tokens_used,
            cost_usd=cost_usd,
            error_message=error_message,
            created_at=datetime.utcnow()
        )
        
        self.db.add(log_entry)
        self.db.commit()
    
    def get_stats(self, hours: int = 24) -> Dict[str, Any]:
        """Get statistics for the last N hours."""
        from datetime import timedelta
        from sqlalchemy import func
        
        cutoff = datetime.utcnow() - timedelta(hours=hours)
        
        logs = self.db.query(APILog).filter(APILog.created_at >= cutoff).all()
        
        if not logs:
            return {
                'total_requests': 0,
                'avg_latency_ms': 0,
                'total_tokens': 0,
                'total_cost_usd': 0,
                'error_rate': 0
            }
        
        total_requests = len(logs)
        avg_latency = sum(log.latency_ms for log in logs) / total_requests
        total_tokens = sum(log.tokens_used or 0 for log in logs)
        total_cost = sum(log.cost_usd or 0 for log in logs)
        errors = sum(1 for log in logs if log.error_message or log.status_code >= 400)
        error_rate = (errors / total_requests) * 100
        
        return {
            'total_requests': total_requests,
            'avg_latency_ms': round(avg_latency, 2),
            'total_tokens': total_tokens,
            'total_cost_usd': round(total_cost, 4),
            'error_rate': round(error_rate, 2),
            'period_hours': hours
        }
