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
  Calendar
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
      if (showToast) toast.success('Dashboard metrics refreshed');
    } catch (err) {
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 10 seconds for real-time overview
    const timer = setInterval(() => fetchData(false), 10000);
    return () => clearInterval(timer);
  }, []);

  const total = stats.total || 1;
  const successPct = Math.round((stats.success / total) * 100);
  const failedPct = Math.round((stats.failed / total) * 100);
  const pendingPct = Math.round((stats.pending / total) * 100);
  const runningPct = Math.round((stats.running / total) * 100);

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-surface-border gap-4">
        <div>
          <h1 className="text-2xl font-bold text-content-primary tracking-tight">System Dashboard</h1>
          <p className="text-xs text-content-secondary mt-0.5">
            Real-time throughput metrics, queue status, and recent activity feed
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-surface-border bg-white text-content-secondary hover:text-content-primary hover:bg-slate-50 text-xs font-medium transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
        {/* Total Tasks */}
        <div className="bg-white p-5 rounded-xl border border-surface-border shadow-sm col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-content-secondary">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Tasks</span>
            <Layers className="w-4 h-4 text-brand" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-navy">{stats.total}</span>
            <span className="text-[11px] text-content-secondary">All time</span>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white p-5 rounded-xl border border-surface-border shadow-sm">
          <div className="flex items-center justify-between text-content-secondary">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-600">{stats.pending}</span>
            <span className="text-[11px] text-amber-600/80 font-medium">{pendingPct}%</span>
          </div>
        </div>

        {/* Running */}
        <div className="bg-white p-5 rounded-xl border border-surface-border shadow-sm">
          <div className="flex items-center justify-between text-content-secondary">
            <span className="text-xs font-semibold uppercase tracking-wider">Running</span>
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-blue-600">{stats.running}</span>
            <span className="text-[11px] text-blue-600/80 font-medium">{runningPct}%</span>
          </div>
        </div>

        {/* Success */}
        <div className="bg-white p-5 rounded-xl border border-surface-border shadow-sm">
          <div className="flex items-center justify-between text-content-secondary">
            <span className="text-xs font-semibold uppercase tracking-wider">Successful</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-600">{stats.success}</span>
            <span className="text-[11px] text-emerald-600/80 font-medium">{successPct}%</span>
          </div>
        </div>

        {/* Failed */}
        <div className="bg-white p-5 rounded-xl border border-surface-border shadow-sm">
          <div className="flex items-center justify-between text-content-secondary">
            <span className="text-xs font-semibold uppercase tracking-wider">Failed</span>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-red-600">{stats.failed}</span>
            <span className="text-[11px] text-red-600/80 font-medium">{failedPct}%</span>
          </div>
        </div>
      </div>

      {/* Distribution Progress Bar */}
      {stats.total > 0 && (
        <div className="bg-white p-4 rounded-xl border border-surface-border shadow-sm mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-content-primary">
              Task Status Distribution
            </span>
            <div className="flex items-center space-x-4 text-xs">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-content-secondary">Success ({stats.success})</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span className="text-content-secondary">Running ({stats.running})</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-content-secondary">Pending ({stats.pending})</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span className="text-content-secondary">Failed ({stats.failed})</span>
              </span>
            </div>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-100 flex overflow-hidden">
            {stats.success > 0 && (
              <div
                style={{ width: `${(stats.success / stats.total) * 100}%` }}
                className="bg-emerald-500 transition-all duration-500"
                title={`Success: ${stats.success}`}
              />
            )}
            {stats.running > 0 && (
              <div
                style={{ width: `${(stats.running / stats.total) * 100}%` }}
                className="bg-blue-500 transition-all duration-500"
                title={`Running: ${stats.running}`}
              />
            )}
            {stats.pending > 0 && (
              <div
                style={{ width: `${(stats.pending / stats.total) * 100}%` }}
                className="bg-amber-400 transition-all duration-500"
                title={`Pending: ${stats.pending}`}
              />
            )}
            {stats.failed > 0 && (
              <div
                style={{ width: `${(stats.failed / stats.total) * 100}%` }}
                className="bg-red-500 transition-all duration-500"
                title={`Failed: ${stats.failed}`}
              />
            )}
          </div>
        </div>
      )}

      {/* Recent Activity Table */}
      <div className="mt-8 bg-white rounded-xl border border-surface-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-brand" />
            <h2 className="text-sm font-semibold text-content-primary uppercase tracking-wider">
              Recent Task Activity
            </h2>
          </div>
          <Link
            to="/tasks"
            className="inline-flex items-center space-x-1 text-xs font-semibold text-brand hover:text-brand-hover"
          >
            <span>View All Tasks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-content-secondary">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand" />
            <span className="text-xs">Loading task telemetry...</span>
          </div>
        ) : recentTasks.length === 0 ? (
          <div className="p-12 text-center">
            <Layers className="w-8 h-8 mx-auto text-content-muted mb-2" />
            <h3 className="text-sm font-medium text-content-primary">No tasks created yet</h3>
            <p className="text-xs text-content-secondary mt-1">
              Submit your first text processing job to start the Python worker queue.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-surface-border text-[11px] font-semibold text-content-secondary uppercase tracking-wider">
                  <th className="px-6 py-3">Task Title</th>
                  <th className="px-6 py-3">Operation</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Submitted</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border text-sm">
                {recentTasks.map((t) => (
                  <tr key={t.taskId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-content-primary">
                      <Link
                        to={`/tasks/${t.taskId}`}
                        className="hover:text-brand transition-colors line-clamp-1"
                      >
                        {t.title}
                      </Link>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-content-secondary">
                        {t.operation}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-6 py-3.5 text-xs text-content-secondary font-mono">
                      {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <Link
                        to={`/tasks/${t.taskId}`}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-brand hover:text-brand-hover hover:bg-brand-light rounded-md transition-colors"
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
