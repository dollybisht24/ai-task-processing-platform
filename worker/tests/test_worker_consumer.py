from unittest.mock import MagicMock, patch
import pytest
from app.queue.redis_consumer import RedisStreamConsumer


@pytest.fixture
def mock_consumer():
    consumer = RedisStreamConsumer()
    consumer.redis_client = MagicMock()
    return consumer


def test_process_message_success(mock_consumer):
    task_id = "507f1f77bcf86cd799439011"
    message_id = "1620000000000-0"
    fields = {"taskId": task_id, "operation": "UPPERCASE"}

    fake_task = {
        "_id": task_id,
        "title": "Test Task",
        "inputText": "hello world",
        "operation": "UPPERCASE",
        "status": "pending"
    }

    with patch("app.services.task_service.TaskService.get_task", return_value=fake_task), \
         patch("app.services.task_service.TaskService.mark_as_running") as mock_running, \
         patch("app.services.task_service.TaskService.mark_as_success") as mock_success:

        mock_consumer.process_message(message_id, fields)

        mock_running.assert_called_once_with(task_id)
        mock_success.assert_called_once()
        args, kwargs = mock_success.call_args
        assert args[0] == task_id
        assert args[1] == "HELLO WORLD"

        # Check XACK was called
        mock_consumer.redis_client.xack.assert_called_once_with(
            mock_consumer.stream_key,
            mock_consumer.group_name,
            message_id
        )


def test_process_message_unsupported_operation(mock_consumer):
    task_id = "507f1f77bcf86cd799439012"
    message_id = "1620000000001-0"
    fields = {"taskId": task_id, "operation": "INVALID_OP"}

    fake_task = {
        "_id": task_id,
        "title": "Bad Task",
        "inputText": "some text",
        "operation": "INVALID_OP",
        "status": "pending"
    }

    with patch("app.services.task_service.TaskService.get_task", return_value=fake_task), \
         patch("app.services.task_service.TaskService.mark_as_running"), \
         patch("app.services.task_service.TaskService.mark_as_failed") as mock_failed:

        mock_consumer.process_message(message_id, fields)

        mock_failed.assert_called_once()
        args, _ = mock_failed.call_args
        assert args[0] == task_id
        assert "Unsupported operation" in args[1]

        mock_consumer.redis_client.xack.assert_called_once()


def test_process_message_idempotent_skip_if_already_success(mock_consumer):
    task_id = "507f1f77bcf86cd799439013"
    message_id = "1620000000002-0"
    fields = {"taskId": task_id, "operation": "UPPERCASE"}

    fake_task = {
        "_id": task_id,
        "status": "success",
        "result": "ALREADY DONE"
    }

    with patch("app.services.task_service.TaskService.get_task", return_value=fake_task), \
         patch("app.services.task_service.TaskService.mark_as_running") as mock_running:

        mock_consumer.process_message(message_id, fields)

        # Should not mark as running
        mock_running.assert_not_called()
        # Should still acknowledge message
        mock_consumer.redis_client.xack.assert_called_once()
