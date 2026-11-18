import { useState, useEffect, useRef, useCallback } from 'react';
import { taskService } from '../services/api';

/**
 * Custom hook to poll task status adaptively in real time.
 * Halts polling immediately when terminal status (success or failed) is reached.
 */
export const useTaskPolling = (taskId, initialTask = null, intervalMs = 1500, onComplete = null) => {
  const [task, setTask] = useState(initialTask);
  const [loading, setLoading] = useState(!initialTask);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  const fetchTask = useCallback(async () => {
    if (!taskId) return;
    try {
      const res = await taskService.getTaskById(taskId);
      const updated = res.data.data;
      setTask(updated);
      setLoading(false);

      // Stop polling once finished
      if (updated.status === 'success' || updated.status === 'failed') {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        if (onComplete) {
          onComplete(updated);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to poll task status');
      setLoading(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [taskId, onComplete]);

  useEffect(() => {
    if (!taskId) return;

    fetchTask();

    // Start polling interval
    timerRef.current = setInterval(fetchTask, intervalMs);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [taskId, intervalMs, fetchTask]);

  return { task, loading, error, refetch: fetchTask };
};
