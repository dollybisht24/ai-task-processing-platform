import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTaskPolling } from '../hooks/useTaskPolling';
import { taskService } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import {
  ArrowLeft,
  RotateCcw,
  Clock,
  Terminal,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Copy,
  Check,
  Download,
  Filter,
  Search,
  Cpu,
  Layers,
  Sparkles,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

export const TaskDetailsPage = () => {
  const { id } = useParams();
  const [retrying, setRetrying] = useState(false);
  const [copiedResult, setCopiedResult] = useState(false);
  const [copiedLogs, setCopiedLogs] = useState(false);
  const [logFilter, setLogFilter] = useState('ALL');
  const [logSearch, setLogSearch] = useState('');

  // Adaptive real-time polling: polls every 1.5s while pending/running, halts immediately on success/failed
  const { task, loading, error, errorStatus, refetch } = useTaskPolling(id, null, 1500, (completed) => {
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
      setCopiedResult(true);
      toast.success('Result copied to clipboard');
      setTimeout(() => setCopiedResult(false), 2000);
    }
  };

  const copyAllLogs = () => {
    if (!task?.logs || task.logs.length === 0) return;
    const formatted = task.logs
      .map((l) => `[${new Date(l.timestamp).toISOString()}] [${l.level}] ${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(formatted);
    setCopiedLogs(true);
    toast.success('All logs copied to clipboard');
    setTimeout(() => setCopiedLogs(false), 2000);
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
    link.download = `task-${task.taskId}-logs.txt`;
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
        <div className="p-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" />
          <p className="text-sm font-semibold text-slate-700">Connecting to task telemetry stream...</p>
          <span className="text-xs text-slate-400 font-mono mt-1 block">Task ID: {id}</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !task) {
    const isRateLimited = errorStatus === 429;
    return (
      <DashboardLayout>
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 shadow-sm max-w-lg mx-auto">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-900">
            {isRateLimited ? 'Requests Temporarily Limited' : 'Task Not Found'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">{error || 'Unable to locate task with specified ID.'}</p>
          {isRateLimited && (
            <button
              type="button"
              onClick={refetch}
              className="inline-flex items-center space-x-2 mt-4 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          )}
          <Link
            to="/tasks"
            className="inline-flex items-center space-x-2 mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to History</span>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const duration = calculateDuration();

  return (
    <DashboardLayout>
      {/* Top Header & Breadcrumb */}
      <div className="pb-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            to="/tasks"
            className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-blue-600 font-semibold mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Task History</span>
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{task.title}</h1>
            <StatusBadge status={task.status} size="sm" />
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400 font-mono">
            <span>ID: {task.taskId}</span>
            <span>•</span>
            <span>Stream: tasks:stream</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5">
          {task.status === 'failed' && (
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
              <span>{retrying ? 'Re-enqueuing...' : 'Retry Task'}</span>
            </button>
          )}

          <button
            onClick={() => refetch()}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left Column (2 Cols): Payload, Results, and Terminal Console */}
        <div className="lg:col-span-2 space-y-6">
          {/* Input Text Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Input Payload
                </h3>
              </div>
              <span className="font-mono text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                {task.operation}
              </span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs font-mono text-slate-800 whitespace-pre-wrap break-words max-h-56 overflow-y-auto leading-relaxed">
              {task.inputText}
            </div>
          </div>

          {/* Result Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2
                  className={`w-4 h-4 ${task.status === 'success' ? 'text-emerald-600' : 'text-slate-400'}`}
                />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Execution Output
                </h3>
              </div>

              {task.result !== null && (
                <button
                  onClick={copyResult}
                  className="inline-flex items-center space-x-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
                >
                  {copiedResult ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedResult ? 'Copied' : 'Copy Result'}</span>
                </button>
              )}
            </div>

            {task.status === 'success' ? (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs font-mono font-medium text-emerald-950 whitespace-pre-wrap break-words leading-relaxed shadow-2xs">
                {String(task.result)}
              </div>
            ) : task.status === 'failed' ? (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                <div className="flex items-start space-x-2.5 text-rose-900 text-xs font-medium">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
                  <div>
                    <span className="font-bold">Execution Failed: </span>
                    <span>{task.errorMessage || 'An error occurred during Python worker execution.'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                <p className="text-xs font-medium text-slate-600">
                  {task.status === 'pending'
                    ? 'Job is queued in Redis Streams awaiting an available worker replica...'
                    : 'Python worker is currently processing text payload...'}
                </p>
              </div>
            )}
          </div>

          {/* Execution Logs Console (Datadog / CloudWatch Style) */}
          <div className="bg-[#0B132B] rounded-2xl border border-slate-800 shadow-lg overflow-hidden">
            {/* Console Toolbar */}
            <div className="px-5 py-3.5 bg-[#070D1E] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2 text-slate-200">
                <Terminal className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-100">
                  Execution Telemetry Stream
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
                  {task.logs?.length || 0} events
                </span>
              </div>

              {/* Log Controls: Search & Level Filter */}
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <input
                    type="text"
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    placeholder="Search logs..."
                    className="pl-7 pr-2.5 py-1 text-[11px] bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-mono w-32 sm:w-40"
                  />
                  <Search className="w-3 h-3 text-slate-500 absolute left-2 top-2" />
                </div>

                <div className="flex items-center space-x-1 bg-slate-900 border border-slate-700 p-0.5 rounded-lg text-[10px] font-mono">
                  {['ALL', 'INFO', 'WARN', 'ERROR'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setLogFilter(lvl)}
                      className={`px-2 py-0.5 rounded font-bold transition-colors ${
                        logFilter === lvl
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>

                <button
                  onClick={copyAllLogs}
                  title="Copy all logs"
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  {copiedLogs ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={downloadLogs}
                  title="Download log file"
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Console Log Stream */}
            <div className="p-4 font-mono text-xs text-slate-200 space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, index) => {
                  const levelBadge = {
                    INFO: 'text-blue-400 bg-blue-950/60 border-blue-800/80',
                    WARN: 'text-amber-400 bg-amber-950/60 border-amber-800/80',
                    ERROR: 'text-rose-400 bg-rose-950/60 border-rose-800/80',
                    DEBUG: 'text-slate-400 bg-slate-950/60 border-slate-800'
                  }[log.level] || 'text-blue-400 bg-blue-950/60 border-blue-800/80';

                  return (
                    <div key={index} className="flex items-start space-x-2.5 leading-relaxed font-mono">
                      <span className="text-slate-500 shrink-0 text-[11px] select-none">
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour12: false,
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </span>

                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${levelBadge}`}>
                        {log.level}
                      </span>

                      <span className="text-slate-200 break-words">{log.message}</span>
                    </div>
                  );
                })
              ) : (
                <div className="text-slate-500 italic py-4 text-center">
                  {task.logs?.length === 0
                    ? 'Waiting for worker process to begin...'
                    : 'No log lines match current search/filter.'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Execution Telemetry Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Task Audit Telemetry</span>
              <Cpu className="w-4 h-4 text-blue-600" />
            </h3>

            <dl className="space-y-4 text-xs">
              <div>
                <dt className="text-slate-400 font-medium">Lifecycle Status</dt>
                <dd className="mt-1">
                  <StatusBadge status={task.status} />
                </dd>
              </div>

              <div>
                <dt className="text-slate-400 font-medium">Text Operation</dt>
                <dd className="mt-1 font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded inline-block">
                  {task.operation}
                </dd>
              </div>

              <div>
                <dt className="text-slate-400 font-medium">Retry Attempts</dt>
                <dd className="mt-1 font-mono font-bold text-slate-900">
                  {task.retryCount || 0}
                </dd>
              </div>

              {duration && (
                <div>
                  <dt className="text-slate-400 font-medium">Worker Execution Duration</dt>
                  <dd className="mt-1 font-mono font-black text-blue-600 text-sm">
                    {duration}
                  </dd>
                </div>
              )}

              <div>
                <dt className="text-slate-400 font-medium">Created (Enqueued)</dt>
                <dd className="mt-1 font-mono text-slate-700">
                  {new Date(task.createdAt).toLocaleString()}
                </dd>
              </div>

              {task.startedAt && (
                <div>
                  <dt className="text-slate-400 font-medium">Worker Picked Up</dt>
                  <dd className="mt-1 font-mono text-slate-700">
                    {new Date(task.startedAt).toLocaleString()}
                  </dd>
                </div>
              )}

              {task.completedAt && (
                <div>
                  <dt className="text-slate-400 font-medium">Completed At</dt>
                  <dd className="mt-1 font-mono text-slate-700">
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
