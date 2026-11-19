from datetime import datetime, timezone
from bson import ObjectId
from typing import Optional, Dict, Any
from app.database.mongo_client import get_task_collection
from app.config.settings import settings


class TaskService:
    @staticmethod
    def _to_object_id(task_id: str) -> Optional[ObjectId]:
        try:
            return ObjectId(task_id)
        except Exception:
            return None

    @classmethod
    def get_task(cls, task_id: str) -> Optional[Dict[str, Any]]:
        oid = cls._to_object_id(task_id)
        if not oid:
            return None
        return get_task_collection().find_one({"_id": oid})

    @classmethod
    def append_log(cls, task_id: str, message: str, level: str = "INFO") -> None:
        oid = cls._to_object_id(task_id)
        if not oid:
            return

        log_entry = {
            "timestamp": datetime.now(timezone.utc),
            "message": message,
            "level": level
        }

        get_task_collection().update_one(
            {"_id": oid},
            {"$push": {"logs": log_entry}, "$set": {"updatedAt": datetime.now(timezone.utc)}}
        )

    @classmethod
    def mark_as_running(cls, task_id: str) -> bool:
        """
        Atomically transition task from pending -> running to prevent race conditions.
        """
        oid = cls._to_object_id(task_id)
        if not oid:
            return False

        now = datetime.now(timezone.utc)
        log_entry = {
            "timestamp": now,
            "message": f"Worker [{settings.WORKER_ID}] picked up job. Processing started.",
            "level": "INFO"
        }

        result = get_task_collection().update_one(
            {"_id": oid, "status": "pending"},
            {
                "$set": {
                    "status": "running",
                    "startedAt": now,
                    "updatedAt": now
                },
                "$push": {"logs": log_entry}
            }
        )

        return result.modified_count > 0

    @classmethod
    def mark_as_success(cls, task_id: str, result_value: Any, duration_ms: float, detail_log: str = "") -> None:
        oid = cls._to_object_id(task_id)
        if not oid:
            return

        now = datetime.now(timezone.utc)
        logs = []
        if detail_log:
            logs.append({
                "timestamp": now,
                "message": detail_log,
                "level": "INFO"
            })
        logs.append({
            "timestamp": now,
            "message": f"Task processed successfully in {duration_ms:.2f}ms by worker [{settings.WORKER_ID}].",
            "level": "INFO"
        })

        get_task_collection().update_one(
            {"_id": oid},
            {
                "$set": {
                    "status": "success",
                    "result": result_value,
                    "completedAt": now,
                    "updatedAt": now
                },
                "$push": {"logs": {"$each": logs}}
            }
        )

    @classmethod
    def mark_as_failed(cls, task_id: str, error_message: str, duration_ms: float) -> None:
        oid = cls._to_object_id(task_id)
        if not oid:
            return

        now = datetime.now(timezone.utc)
        log_entry = {
            "timestamp": now,
            "message": f"Task failed after {duration_ms:.2f}ms: {error_message}",
            "level": "ERROR"
        }

        get_task_collection().update_one(
            {"_id": oid},
            {
                "$set": {
                    "status": "failed",
                    "errorMessage": error_message,
                    "completedAt": now,
                    "updatedAt": now
                },
                "$push": {"logs": log_entry}
            }
        )
