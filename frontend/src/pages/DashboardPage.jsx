import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { taskService } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import {
  Layers,
  Clock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  RefreshCw,
  Activity,
  Zap,
  TrendingUp,
  Server,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import toast from 'react-hot-toast';

export const DashboardPage = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    running: 0,
    success: 0,
    failed: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      const [statsRes, tasksRes] = await Promise.all([
        taskService.getStats(),
        taskService.getTasks({ page: 1, limit: 6 })
      ]);

      setStats(statsRes.data.data);
      setRecentTasks(tasksRes.data.data);
      if (showToast) toast.success('Telemetry data refreshed');
    } catch (err) {
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => fetchData(false), 8000);
    return () => clearInterval(timer);
  }, []);

  const total = stats.total || 0;
  const successRate = total > 0 ? Math.round((stats.success / total) * 100) : 100;

  return (
    <DashboardLayout>
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200/80 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Telemetry</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 tracking-wide">
              LIVE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time asynchronous job throughput, Redis Streams consumer metrics, and execution history
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-all active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
        {/* Total Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Enqueued</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.total}</span>
            <span className="text-[11px] text-slate-400 font-mono">Stream Tasks</span>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">In Queue (Pending)</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-amber-600 tracking-tight">{stats.pending}</span>
            <span className="text-[11px] text-amber-700/80 font-medium">Awaiting Consumer</span>
          </div>
        </div>

        {/* Running Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active (Running)</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-indigo-600 tracking-tight">{stats.running}</span>
            <span className="text-[11px] text-indigo-700/80 font-medium">In Worker Memory</span>
          </div>
        </div>

        {/* Successful Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Completed (Success)</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">{stats.success}</span>
            <span className="text-[11px] text-emerald-700 font-semibold font-mono">{successRate}% rate</span>
          </div>
        </div>

        {/* Failed Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Failed / Stalled</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-rose-600 tracking-tight">{stats.failed}</span>
            <span className="text-[11px] text-rose-700/80 font-medium">{stats.failed > 0 ? 'Action Req' : '0 errors'}</span>
          </div>
        </div>
      </div>

      {/* Progress & Architecture Status Bar */}
      <div className="mt-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Queue State & Distribution
            </h3>
            <p className="text-[11px] text-slate-400">
              Real-time ratio across the entire processing lifecycle
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-600">Success ({stats.success})</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              <span className="text-slate-600">Running ({stats.running})</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span className="text-slate-600">Pending ({stats.pending})</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-slate-600">Failed ({stats.failed})</span>
            </span>
          </div>
        </div>

        {/* Visual Progress Line */}
        <div className="w-full h-3 rounded-full bg-slate-100 flex overflow-hidden p-0.5">
          {total === 0 ? (
            <div className="w-full bg-slate-200 rounded-full"></div>
          ) : (
            <>
              {stats.success > 0 && (
                <div
                  style={{ width: `${(stats.success / total) * 100}%` }}
                  className="bg-emerald-500 rounded-full transition-all duration-500"
                  title={`Success: ${stats.success}`}
                />
              )}
              {stats.running > 0 && (
                <div
                  style={{ width: `${(stats.running / total) * 100}%` }}
                  className="bg-indigo-500 rounded-full transition-all duration-500"
                  title={`Running: ${stats.running}`}
                />
              )}
              {stats.pending > 0 && (
                <div
                  style={{ width: `${(stats.pending / total) * 100}%` }}
                  className="bg-amber-400 rounded-full transition-all duration-500"
                  title={`Pending: ${stats.pending}`}
                />
              )}
              {stats.failed > 0 && (
                <div
                  style={{ width: `${(stats.failed / total) * 100}%` }}
                  className="bg-rose-500 rounded-full transition-all duration-500"
                  title={`Failed: ${stats.failed}`}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Recent Activity Table Card */}
      <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
          <div className="flex items-center space-x-2.5">
            <Activity className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Recent Job Executions
            </h2>
          </div>
          <Link
            to="/tasks"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span>View All History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <span className="text-xs font-medium">Streaming job telemetry...</span>
          </div>
        ) : recentTasks.length === 0 ? (
          <div className="p-16 text-center">
            <Layers className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No active tasks found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Create your first text-processing job to see Python workers consume and process tasks in real time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Task Title</th>
                  <th className="px-6 py-3.5">Operation</th>
                  <th className="px-6 py-3.5">Current Status</th>
                  <th className="px-6 py-3.5">Submitted</th>
                  <th className="px-6 py-3.5 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recentTasks.map((t) => (
                  <tr key={t.taskId} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <Link
                        to={`/tasks/${t.taskId}`}
                        className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1"
                      >
                        {t.title}
                      </Link>
                      <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
                        ID: {t.taskId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {t.operation}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={t.status} size="xs" />
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-500">
                      {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/tasks/${t.taskId}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all border border-blue-200 hover:border-blue-600 shadow-2xs"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
