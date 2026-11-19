import React, { useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTaskPolling } from '../hooks/useTaskPolling';
import { taskService } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import {
  ArrowLeft,
  RotateCw,
  Terminal,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  Download,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';

export const TaskDetailsPage = () => {
  const { id } = useParams();
  const [retrying, setRetrying] = useState(false);
  const [copiedResult, setCopiedResult] = useState(false);
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedLogs, setCopiedLogs] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [logFilter, setLogFilter] = useState('ALL');
  const [logSearch, setLogSearch] = useState('');

  // Handle task completion notification exactly once with unique toast ID
  const handleComplete = useCallback((completed) => {
    if (completed.status === 'success') {
      toast.success('Task execution completed successfully!', { id: `task-status-${id}` });
    } else if (completed.status === 'failed') {
      toast.error('Task execution failed.', { id: `task-status-${id}` });
    }
  }, [id]);

  // Adaptive real-time polling
  const { task, loading, error, errorStatus, refetch } = useTaskPolling(id, null, 1500, handleComplete);

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

  const copyToClipboard = (text, setCopiedFn, label) => {
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    setCopiedFn(true);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedFn(false), 2000);
  };

  const downloadLogs = () => {
    if (!task?.logs || task.logs.length === 0) return;
    const formatted = task.logs
      .map((l) => `[${new Date(l.timestamp).toISOString()}] [${l.level}] ${l.message}`)
      .join('\n');
    const blob = new Blob([formatted], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `task-${task.taskId || id}-logs.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Logs downloaded');
  };

  // Filter logs by level & search query
  const filteredLogs = useMemo(() => {
    if (!task?.logs) return [];
    return task.logs.filter((log) => {
      const matchesLevel = logFilter === 'ALL' || log.level === logFilter;
      const matchesSearch =
        !logSearch.trim() ||
        log.message.toLowerCase().includes(logSearch.toLowerCase().trim());
      return matchesLevel && matchesSearch;
    });
  }, [task?.logs, logFilter, logSearch]);

  const calculateDuration = () => {
    if (!task?.startedAt || !task?.completedAt) return null;
    const ms = new Date(task.completedAt).getTime() - new Date(task.startedAt).getTime();
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (loading && !task) {
    return (
      <DashboardLayout>
        <div className="py-24 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading task...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !task) {
    const isRateLimited = errorStatus === 429;
    return (
      <DashboardLayout>
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 max-w-md mx-auto my-8">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-slate-900">
            {isRateLimited ? 'Requests Temporarily Limited' : 'Task Not Found'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">{error || 'Unable to locate task.'}</p>
          <div className="mt-5 flex items-center justify-center gap-3">
            {isRateLimited && (
              <button
                type="button"
                onClick={refetch}
                className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-medium"
              >
                Try Again
              </button>
            )}
            <Link
              to="/tasks"
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-medium"
            >
              Return to Tasks
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const duration = calculateDuration();

  return (
    <DashboardLayout>
      {/* Header Bar */}
      <div className="pb-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            to="/tasks"
            className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Tasks</span>
          </Link>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{task.title}</h1>
            <StatusBadge status={task.status} size="sm" />
            <span className="text-[11px] font-mono font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
              {task.operation}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {task.status === 'failed' && (
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
              <span>{retrying ? 'Retrying...' : 'Retry Task'}</span>
            </button>
          )}

          <button
            onClick={() => refetch()}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left Column (2 Cols): Payload, Output, Logs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Input Text Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Input Payload
                </h3>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(task.inputText, setCopiedInput, 'Input payload')}
                className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800"
              >
                {copiedInput ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedInput ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 text-xs font-mono text-slate-800 whitespace-pre-wrap break-words max-h-52 overflow-y-auto leading-relaxed">
              {task.inputText}
            </div>
          </div>

          {/* Execution Result Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <CheckCircle2
                  className={`w-4 h-4 ${task.status === 'success' ? 'text-emerald-600' : 'text-slate-400'}`}
                />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Output Result
                </h3>
              </div>

              {task.result !== null && task.result !== undefined && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(task.result, setCopiedResult, 'Result')}
                  className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800"
                >
                  {copiedResult ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedResult ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            {task.status === 'success' ? (
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-lg text-xs font-mono font-medium text-emerald-950 whitespace-pre-wrap break-words leading-relaxed">
                {String(task.result)}
              </div>
            ) : task.status === 'failed' ? (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start space-x-2 text-rose-800 text-xs">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
                <div>
                  <span className="font-semibold">Execution Failed: </span>
                  <span>{task.errorMessage || 'An error occurred during execution.'}</span>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-50 rounded-lg border border-slate-200">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-2" />
                <p className="text-xs text-slate-600">
                  {task.status === 'pending'
                    ? 'Job is queued in Redis Streams awaiting background worker...'
                    : 'Python worker is currently processing text payload...'}
                </p>
              </div>
            )}
          </div>

          {/* Execution Logs Terminal */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden text-slate-200">
            {/* Terminal Header */}
            <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-200">Execution Logs</span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  {task.logs?.length || 0} events
                </span>
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <input
                    type="text"
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    placeholder="Search logs..."
                    className="pl-7 pr-2.5 py-1 text-[11px] bg-slate-800 border border-slate-700 rounded text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-slate-500 font-mono w-28 sm:w-36"
                  />
                  <Search className="w-3 h-3 text-slate-500 absolute left-2 top-2" />
                </div>

                <div className="flex items-center space-x-0.5 bg-slate-800 border border-slate-700 p-0.5 rounded text-[10px]">
                  {['ALL', 'INFO', 'WARN', 'ERROR'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setLogFilter(lvl)}
                      className={`px-1.5 py-0.5 rounded font-medium transition-colors ${
                        logFilter === lvl
                          ? 'bg-slate-700 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!task?.logs || task.logs.length === 0) return;
                    const text = task.logs
                      .map((l) => `[${new Date(l.timestamp).toISOString()}] [${l.level}] ${l.message}`)
                      .join('\n');
                    copyToClipboard(text, setCopiedLogs, 'All logs');
                  }}
                  title="Copy logs"
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  {copiedLogs ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={downloadLogs}
                  title="Download logs"
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="p-4 font-mono text-xs space-y-1.5 max-h-72 overflow-y-auto">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, index) => {
                  const levelBadge = {
                    INFO: 'text-blue-400 bg-blue-950/80 border-blue-900',
                    WARN: 'text-amber-400 bg-amber-950/80 border-amber-900',
                    ERROR: 'text-rose-400 bg-rose-950/80 border-rose-900',
                    DEBUG: 'text-slate-400 bg-slate-800 border-slate-700'
                  }[log.level] || 'text-slate-400 bg-slate-800 border-slate-700';

                  return (
                    <div key={index} className="flex items-start space-x-2 leading-relaxed">
                      <span className="text-slate-500 shrink-0 text-[11px] select-none">
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour12: false,
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </span>

                      <span className={`text-[10px] font-semibold px-1 py-0.2 rounded border shrink-0 ${levelBadge}`}>
                        {log.level}
                      </span>

                      <span className="text-slate-300 break-words">{log.message}</span>
                    </div>
                  );
                })
              ) : (
                <div className="text-slate-500 italic py-4 text-center">
                  {task.logs?.length === 0
                    ? 'No execution logs recorded yet.'
                    : 'No log lines match current search/filter.'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Task Metadata */}
        <div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-4 pb-3 border-b border-slate-100">
              Task Details
            </h3>

            <dl className="space-y-3.5 text-xs">
              <div>
                <dt className="text-slate-400 font-medium">Task ID</dt>
                <dd className="mt-1 flex items-center space-x-1.5">
                  <span className="font-mono text-slate-800 text-[11px] truncate max-w-[200px]">
                    {task.taskId || id}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(task.taskId || id, setCopiedId, 'Task ID')}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded"
                    title="Copy Task ID"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </dd>
              </div>

              <div>
                <dt className="text-slate-400 font-medium">Status</dt>
                <dd className="mt-1">
                  <StatusBadge status={task.status} />
                </dd>
              </div>

              <div>
                <dt className="text-slate-400 font-medium">Operation</dt>
                <dd className="mt-1 font-mono font-medium text-slate-900">
                  {task.operation}
                </dd>
              </div>

              {duration && (
                <div>
                  <dt className="text-slate-400 font-medium">Execution Duration</dt>
                  <dd className="mt-1 font-mono font-semibold text-emerald-600">
                    {duration}
                  </dd>
                </div>
              )}

              <div>
                <dt className="text-slate-400 font-medium">Created</dt>
                <dd className="mt-1 text-slate-700">
                  {new Date(task.createdAt).toLocaleString()}
                </dd>
              </div>

              {task.completedAt && (
                <div>
                  <dt className="text-slate-400 font-medium">Completed</dt>
                  <dd className="mt-1 text-slate-700">
                    {new Date(task.completedAt).toLocaleString()}
                  </dd>
                </div>
              )}

              <div>
                <dt className="text-slate-400 font-medium">Queue Stream</dt>
                <dd className="mt-1 font-mono text-slate-600">
                  tasks:stream
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TaskDetailsPage;
