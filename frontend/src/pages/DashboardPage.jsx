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
  RotateCw,
  ChevronRight
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
    const timer = setInterval(() => fetchData(false), 10000);
    return () => clearInterval(timer);
  }, []);

  const total = stats.total || 0;
  const successRate = total > 0 ? Math.round((stats.success / total) * 100) : 100;

  return (
    <DashboardLayout>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status of your asynchronous background task processing pipeline
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors self-start sm:self-auto"
        >
          <RotateCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mt-6">
        {/* Total */}
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Tasks</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {stats.total}
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pending</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600">
            {stats.pending}
          </div>
        </div>

        {/* Running */}
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Processing</span>
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-600">
            {stats.running}
          </div>
        </div>

        {/* Success */}
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold text-emerald-600">{stats.success}</span>
            <span className="text-[11px] text-slate-400 font-medium">({successRate}%)</span>
          </div>
        </div>

        {/* Failed */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Failed</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600">
            {stats.failed}
          </div>
        </div>
      </div>

      {/* Distribution Bar */}
      {total > 0 && (
        <div className="mt-4 bg-white p-3.5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-2">
            <span>Queue Distribution</span>
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Success ({stats.success})</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Running ({stats.running})</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Pending ({stats.pending})</span>
              </span>
              {stats.failed > 0 && (
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>Failed ({stats.failed})</span>
                </span>
              )}
            </div>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 flex overflow-hidden">
            {stats.success > 0 && (
              <div style={{ width: `${(stats.success / total) * 100}%` }} className="bg-emerald-500" />
            )}
            {stats.running > 0 && (
              <div style={{ width: `${(stats.running / total) * 100}%` }} className="bg-blue-500" />
            )}
            {stats.pending > 0 && (
              <div style={{ width: `${(stats.pending / total) * 100}%` }} className="bg-amber-400" />
            )}
            {stats.failed > 0 && (
              <div style={{ width: `${(stats.failed / total) * 100}%` }} className="bg-rose-500" />
            )}
          </div>
        </div>
      )}

      {/* Recent Executions Table */}
      <div className="mt-6 bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Recent Executions
          </h2>
          <Link
            to="/tasks"
            className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
            <span className="text-xs">Loading tasks...</span>
          </div>
        ) : recentTasks.length === 0 ? (
          <div className="p-12 text-center">
            <Layers className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-xs text-slate-500">No tasks submitted yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Task</th>
                  <th className="px-5 py-3">Operation</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTasks.map((t) => (
                  <tr key={t.taskId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      <Link
                        to={`/tasks/${t.taskId}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {t.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {t.operation}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={t.status} size="xs" />
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px]">
                      {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to={`/tasks/${t.taskId}`}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 inline-flex items-center space-x-0.5"
                      >
                        <span>View</span>
                        <ChevronRight className="w-3.5 h-3.5" />
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
