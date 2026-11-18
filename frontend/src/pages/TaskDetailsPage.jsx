import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTaskPolling } from '../hooks/useTaskPolling';
import { taskService } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import {
  ArrowLeft,
  RotateCcw,
  Clock,
  Calendar,
  Terminal,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Copy,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

export const TaskDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [retrying, setRetrying] = useState(false);
  const [copied, setCopied] = useState(false);

  // Polls task state automatically every 1.5s while pending or running, halts on terminal state
  const { task, loading, error, refetch } = useTaskPolling(id, null, 1500, (completed) => {
    if (completed.status === 'success') {
      toast.success('Task execution completed successfully!');
    } else if (completed.status === 'failed') {
      toast.error('Task execution failed.');
    }
  });

  const handleRetry = async () => {
    try {
      setRetrying(true);
      await taskService.retryTask(id);
      toast.success('Task queued for retry!');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to retry task');
    } finally {
      setRetrying(false);
    }
  };

  const copyResult = () => {
    if (task?.result !== null && task?.result !== undefined) {
      navigator.clipboard.writeText(String(task.result));
      setCopied(true);
      toast.success('Result copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const calculateDuration = () => {
    if (!task?.startedAt || !task?.completedAt) return null;
    const ms = new Date(task.completedAt).getTime() - new Date(task.startedAt).getTime();
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (loading && !task) {
    return (
      <DashboardLayout>
        <div className="p-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand mb-3" />
          <p className="text-sm text-content-secondary">Loading task execution telemetry...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !task) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center bg-white rounded-xl border border-surface-border">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-content-primary">Task Not Found</h2>
          <p className="text-sm text-content-secondary mt-1">{error || 'Task could not be located.'}</p>
          <Link
            to="/tasks"
            className="inline-flex items-center space-x-2 mt-4 px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Task History</span>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const duration = calculateDuration();

  return (
    <DashboardLayout>
      {/* Top Breadcrumb & Action Header */}
      <div className="pb-6 border-b border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/tasks"
            className="inline-flex items-center space-x-1.5 text-xs text-content-secondary hover:text-brand font-medium mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Tasks</span>
          </Link>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-content-primary tracking-tight">{task.title}</h1>
            <StatusBadge status={task.status} size="sm" />
          </div>
          <span className="font-mono text-xs text-content-muted mt-1 block">
            Task ID: {task.taskId}
          </span>
        </div>

        {/* Retry Button if Failed */}
        {task.status === 'failed' && (
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
            <span>{retrying ? 'Re-enqueuing...' : 'Retry Task'}</span>
          </button>
        )}
      </div>

      {/* Main Grid: Payload & Execution Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left Column (2 Cols): Input & Output */}
        <div className="lg:col-span-2 space-y-6">
          {/* Input Text Section */}
          <div className="bg-white rounded-xl border border-surface-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-brand" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-content-primary">
                  Input Text Payload
                </h3>
              </div>
              <span className="font-mono text-[11px] text-content-secondary bg-slate-100 px-2 py-0.5 rounded">
                Operation: {task.operation}
              </span>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/70 text-xs font-mono text-content-primary whitespace-pre-wrap break-words max-h-60 overflow-y-auto">
              {task.inputText}
            </div>
          </div>

          {/* Result or Error Section */}
          <div className="bg-white rounded-xl border border-surface-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className={`w-4 h-4 ${task.status === 'success' ? 'text-emerald-500' : 'text-content-muted'}`} />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-content-primary">
                  Processing Result
                </h3>
              </div>

              {task.result !== null && (
                <button
                  onClick={copyResult}
                  className="inline-flex items-center space-x-1 text-xs text-brand hover:text-brand-hover font-medium"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            {task.status === 'success' ? (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs font-mono text-emerald-950 whitespace-pre-wrap break-words">
                {String(task.result)}
              </div>
            ) : task.status === 'failed' ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-2 text-red-800 text-xs font-medium">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                  <div>
                    <span className="font-bold">Execution Failed: </span>
                    <span>{task.errorMessage || 'An error occurred during worker execution.'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50/50 rounded-lg border border-dashed border-slate-300">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand mb-2" />
                <p className="text-xs font-medium text-content-secondary">
                  {task.status === 'pending'
                    ? 'Task is waiting in Redis Stream queue for available worker...'
                    : 'Python worker is actively processing payload...'}
                </p>
              </div>
            )}
          </div>

          {/* Execution Logs Console */}
          <div className="bg-navy rounded-xl border border-navy-light shadow-md overflow-hidden">
            <div className="px-5 py-3 bg-navy-dark border-b border-navy-light flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-300">
                <Terminal className="w-4 h-4 text-brand" />
                <span className="text-xs font-mono font-semibold uppercase tracking-wider">
                  Live Execution Logs
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {task.logs?.length || 0} event(s)
              </span>
            </div>

            <div className="p-4 font-mono text-xs text-slate-200 space-y-1.5 max-h-72 overflow-y-auto custom-scrollbar">
              {task.logs && task.logs.length > 0 ? (
                task.logs.map((log, index) => {
                  const levelColor = {
                    INFO: 'text-blue-400',
                    WARN: 'text-amber-400',
                    ERROR: 'text-red-400',
                    DEBUG: 'text-slate-400'
                  }[log.level] || 'text-blue-400';

                  return (
                    <div key={index} className="flex items-start space-x-2 leading-relaxed">
                      <span className="text-slate-500 shrink-0 text-[11px]">
                        [{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                      </span>
                      <span className={`font-semibold shrink-0 ${levelColor}`}>
                        [{log.level}]
                      </span>
                      <span className="text-slate-300 break-words">{log.message}</span>
                    </div>
                  );
                })
              ) : (
                <div className="text-slate-500 italic">No execution logs recorded yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Metadata Audit Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-surface-border p-6 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-content-primary mb-4 pb-2 border-b border-surface-border">
              Task Telemetry & Metadata
            </h3>

            <dl className="space-y-3.5 text-xs">
              <div>
                <dt className="text-content-secondary font-medium">Current Status</dt>
                <dd className="mt-1">
                  <StatusBadge status={task.status} />
                </dd>
              </div>

              <div>
                <dt className="text-content-secondary font-medium">Selected Operation</dt>
                <dd className="mt-1 font-mono font-semibold text-content-primary">
                  {task.operation}
                </dd>
              </div>

              <div>
                <dt className="text-content-secondary font-medium">Retry Attempts</dt>
                <dd className="mt-1 font-mono text-content-primary">
                  {task.retryCount || 0}
                </dd>
              </div>

              {duration && (
                <div>
                  <dt className="text-content-secondary font-medium">Execution Duration</dt>
                  <dd className="mt-1 font-mono font-semibold text-brand">
                    {duration}
                  </dd>
                </div>
              )}

              <div>
                <dt className="text-content-secondary font-medium">Created Timestamp</dt>
                <dd className="mt-1 font-mono text-content-primary">
                  {new Date(task.createdAt).toLocaleString()}
                </dd>
              </div>

              {task.startedAt && (
                <div>
                  <dt className="text-content-secondary font-medium">Started Processing</dt>
                  <dd className="mt-1 font-mono text-content-primary">
                    {new Date(task.startedAt).toLocaleString()}
                  </dd>
                </div>
              )}

              {task.completedAt && (
                <div>
                  <dt className="text-content-secondary font-medium">Completed Processing</dt>
                  <dd className="mt-1 font-mono text-content-primary">
                    {new Date(task.completedAt).toLocaleString()}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TaskDetailsPage;
