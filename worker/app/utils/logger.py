import json
import logging
import sys
from datetime import datetime, timezone
from app.config.settings import settings


class JSONFormatter(logging.Formatter):
    """
    Structured JSON log formatter for production observability
    """

    def format(self, record: logging.LogRecord) -> str:
        log_obj = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "worker_id": settings.WORKER_ID,
            "message": record.getMessage(),
            "logger": record.name
        }

        # Extra fields attached to the record
        for key in ["task_id", "operation", "duration_ms", "status", "retry_count", "error"]:
            if hasattr(record, key):
                log_obj[key] = getattr(record, key)

        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_obj)


def get_logger(name: str = "ai-worker") -> logging.Logger:
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO))

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(JSONFormatter())
        logger.addHandler(handler)

    logger.propagate = False
    return logger


logger = get_logger("worker")
