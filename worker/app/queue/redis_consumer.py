import time
import traceback
from typing import Dict, Any, Optional
import redis
from redis.exceptions import RedisError, ResponseError

from app.config.settings import settings
from app.utils.logger import logger
from app.processors.text_processor import TextProcessor, TextProcessingError
from app.services.task_service import TaskService


class RedisStreamConsumer:
    """
    Robust Redis Streams Consumer Group implementation.
    Features:
      - XREADGROUP consumption for distributed worker replicas
      - XACK job acknowledgment
      - XAUTOCLAIM dead/orphaned worker message recovery
      - Graceful shutdown without data loss
      - Idempotent processing and atomic status updates
    """

    def __init__(self):
        self.stream_key = settings.STREAM_KEY
        self.group_name = settings.CONSUMER_GROUP
        self.worker_id = settings.WORKER_ID
        self.redis_client: Optional[redis.Redis] = None
        self.is_running = False
        self.last_autoclaim_check = 0

    def connect(self) -> redis.Redis:
        if self.redis_client is None:
            logger.info(
                f"Connecting worker [{self.worker_id}] to Redis at "
                f"{settings.REDIS_HOST}:{settings.REDIS_PORT}..."
            )
            self.redis_client = redis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                password=settings.REDIS_PASSWORD if settings.REDIS_PASSWORD else None,
                decode_responses=True,
                socket_timeout=5,
                socket_connect_timeout=5
            )
            self.ensure_stream_and_group()
        return self.redis_client

    def ensure_stream_and_group(self) -> None:
        """
        Creates consumer group and stream if not already initialized.
        """
        try:
            self.redis_client.xgroup_create(
                name=self.stream_key,
                groupname=self.group_name,
                id="$",
                mkstream=True
            )
            logger.info(f"Created consumer group '{self.group_name}' on stream '{self.stream_key}'")
        except ResponseError as e:
            if "BUSYGROUP" in str(e):
                logger.debug(f"Consumer group '{self.group_name}' already exists.")
            else:
                logger.error(f"Error ensuring Redis Stream group: {str(e)}")
                raise

    def process_message(self, message_id: str, fields: Dict[str, Any]) -> None:
        """
        Processes a single message consumed from Redis Stream.
        """
        task_id = fields.get("taskId")
        operation = fields.get("operation")
        start_time = time.perf_counter()

        logger.info(
            f"Received job for task [{task_id}] (message_id: {message_id})",
            extra={"task_id": task_id, "operation": operation, "status": "received"}
        )

        if not task_id:
            logger.error(f"Received malformed message without taskId: {fields}. Acknowledging.")
            self.redis_client.xack(self.stream_key, self.group_name, message_id)
            return

        # Fetch task from MongoDB
        task = TaskService.get_task(task_id)
        if not task:
            logger.warn(f"Task [{task_id}] not found in MongoDB. Acknowledging message.")
            self.redis_client.xack(self.stream_key, self.group_name, message_id)
            return

        # Idempotency check: if task already completed successfully, just ACK
        if task.get("status") == "success":
            logger.info(f"Task [{task_id}] already completed successfully. Skipping.")
            self.redis_client.xack(self.stream_key, self.group_name, message_id)
            return

        # Atomic transition to running status
        TaskService.mark_as_running(task_id)

        input_text = task.get("inputText", "")
        task_operation = operation or task.get("operation")

        try:
            # Execute actual text transformation
            result, detail_log = TextProcessor.process(task_operation, input_text)
            duration_ms = (time.perf_counter() - start_time) * 1000

            # Update MongoDB with success result, logs, and timestamps
            TaskService.mark_as_success(task_id, result, duration_ms, detail_log)

            logger.info(
                f"Task [{task_id}] completed successfully in {duration_ms:.2f}ms",
                extra={
                    "task_id": task_id,
                    "operation": task_operation,
                    "duration_ms": duration_ms,
                    "status": "success"
                }
            )

            # Acknowledge message in Redis Stream
            self.redis_client.xack(self.stream_key, self.group_name, message_id)

        except TextProcessingError as tpe:
            duration_ms = (time.perf_counter() - start_time) * 1000
            error_msg = str(tpe)
            TaskService.mark_as_failed(task_id, error_msg, duration_ms)

            logger.error(
                f"Task [{task_id}] processing error: {error_msg}",
                extra={"task_id": task_id, "error": error_msg, "status": "failed"}
            )
            # Acknowledge non-recoverable client error
            self.redis_client.xack(self.stream_key, self.group_name, message_id)

        except Exception as exc:
            duration_ms = (time.perf_counter() - start_time) * 1000
            error_msg = f"Unexpected worker error: {str(exc)}"
            TaskService.mark_as_failed(task_id, error_msg, duration_ms)

            logger.error(
                f"Task [{task_id}] unexpected exception: {error_msg}\n{traceback.format_exc()}",
                extra={"task_id": task_id, "error": error_msg, "status": "failed"}
            )
            # Acknowledge to prevent poison pill loop
            self.redis_client.xack(self.stream_key, self.group_name, message_id)

    def recover_stalled_messages(self) -> None:
        """
        Recovers messages left unacknowledged by crashed workers (idle > 30s).
        """
        now = time.time()
        # Run every 15 seconds
        if now - self.last_autoclaim_check < 15:
            return

        self.last_autoclaim_check = now
        try:
            # xautoclaim: transfers ownership of pending messages idle > min_idle_time
            result = self.redis_client.xautoclaim(
                name=self.stream_key,
                groupname=self.group_name,
                consumername=self.worker_id,
                min_idle_time=settings.CLAIM_MIN_IDLE_TIME_MS,
                start_id="0-0",
                count=5
            )

            if result and len(result) > 1:
                claimed_messages = result[1]
                if claimed_messages:
                    logger.info(
                        f"Worker [{self.worker_id}] recovered {len(claimed_messages)} stalled job(s) from dead workers"
                    )
                    for msg_id, fields in claimed_messages:
                        self.process_message(msg_id, fields)
        except Exception as e:
            logger.warn(f"Error during pending message autoclaim: {str(e)}")

    def run(self) -> None:
        """
        Main worker polling loop.
        """
        self.is_running = True
        logger.info(f"Worker [{self.worker_id}] started listening on Redis Stream '{self.stream_key}'")

        while self.is_running:
            try:
                client = self.connect()

                # Periodically recover stalled messages from crashed worker pods
                self.recover_stalled_messages()

                # Read new messages from stream for this consumer group
                # '>' means only messages never delivered to other consumers in this group
                streams = {self.stream_key: ">"}
                messages = client.xreadgroup(
                    groupname=self.group_name,
                    consumername=self.worker_id,
                    streams=streams,
                    count=1,
                    block=settings.POLL_BLOCK_MS
                )

                if messages:
                    for stream_name, msg_list in messages:
                        for message_id, fields in msg_list:
                            self.process_message(message_id, fields)

            except redis.ConnectionError as ce:
                logger.error(f"Redis connection lost: {str(ce)}. Reconnecting in 3 seconds...")
                self.redis_client = None
                time.sleep(3)
            except Exception as e:
                logger.error(f"Error in consumer loop: {str(e)}\n{traceback.format_exc()}")
                time.sleep(1)

        logger.info(f"Worker [{self.worker_id}] consumer loop terminated gracefully.")

    def stop(self) -> None:
        """
        Signals consumer loop to stop.
        """
        logger.info(f"Worker [{self.worker_id}] stop signal received.")
        self.is_running = False
        if self.redis_client:
            try:
                self.redis_client.close()
            except Exception:
                pass
            self.redis_client = None
