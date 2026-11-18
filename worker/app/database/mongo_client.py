from pymongo import MongoClient
from pymongo.errors import PyMongoError
from app.config.settings import settings
from app.utils.logger import logger

_mongo_client = None


def get_mongo_client() -> MongoClient:
    global _mongo_client
    if _mongo_client is None:
        try:
            logger.info(f"Connecting to MongoDB at {settings.MONGODB_URI}...")
            _mongo_client = MongoClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
                maxPoolSize=50
            )
            # Verify connectivity
            _mongo_client.admin.command("ping")
            logger.info("Successfully connected to MongoDB")
        except PyMongoError as e:
            logger.error(f"Failed to connect to MongoDB: {str(e)}")
            raise
    return _mongo_client


def get_db():
    client = get_mongo_client()
    return client[settings.MONGODB_DATABASE]


def get_task_collection():
    return get_db()["tasks"]


def close_mongo_connection():
    global _mongo_client
    if _mongo_client:
        _mongo_client.close()
        _mongo_client = None
        logger.info("MongoDB client closed")
