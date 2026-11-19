import os
import socket
import uuid
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Worker Identity
    WORKER_ID: str = os.getenv(
        "WORKER_ID",
        f"worker-{socket.gethostname()}-{uuid.uuid4().hex[:6]}"
    )
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    # Redis Stream Configuration
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_PASSWORD: str = os.getenv("REDIS_PASSWORD", "")
    STREAM_KEY: str = os.getenv("STREAM_KEY", "tasks:stream")
    CONSUMER_GROUP: str = os.getenv("CONSUMER_GROUP", "task_workers")

    # MongoDB Configuration
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017/ai_task_platform")
    MONGODB_DATABASE: str = os.getenv("MONGODB_DATABASE", "ai_task_platform")

    # Processing limits & timeouts
    CLAIM_MIN_IDLE_TIME_MS: int = int(os.getenv("CLAIM_MIN_IDLE_TIME_MS", "30000"))  # 30s
    POLL_BLOCK_MS: int = int(os.getenv("POLL_BLOCK_MS", "2000"))  # 2s block
    MAX_RETRIES: int = int(os.getenv("MAX_RETRIES", "3"))

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
