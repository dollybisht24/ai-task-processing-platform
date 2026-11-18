import signal
import sys
from app.config.settings import settings
from app.utils.logger import logger
from app.database.mongo_client import get_mongo_client, close_mongo_connection
from app.queue.redis_consumer import RedisStreamConsumer


def main():
    logger.info("==================================================")
    logger.info(f"Starting AI Task Processing Worker [{settings.WORKER_ID}]")
    logger.info(f"Stream: {settings.STREAM_KEY} | Group: {settings.CONSUMER_GROUP}")
    logger.info("==================================================")

    # Initialize MongoDB connection early
    get_mongo_client()

    consumer = RedisStreamConsumer()

    # Graceful shutdown handler
    def handle_shutdown(signum, frame):
        sig_name = signal.Signals(signum).name
        logger.info(f"Signal {sig_name} received. Initiating graceful shutdown...")
        consumer.stop()
        close_mongo_connection()
        sys.exit(0)

    signal.signal(signal.SIGINT, handle_shutdown)
    signal.signal(signal.SIGTERM, handle_shutdown)

    try:
        consumer.run()
    except Exception as e:
        logger.critical(f"Worker crashed with unhandled error: {str(e)}")
        close_mongo_connection()
        sys.exit(1)


if __name__ == "__main__":
    main()
