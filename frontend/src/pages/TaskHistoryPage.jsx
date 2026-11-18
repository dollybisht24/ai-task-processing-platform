import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { taskService } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Loader2,
  Clock,
  Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

export const TaskHistoryPage = () => {
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    totalTasks: 0,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchTasks = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder
      };
      if (statusFilter) params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await taskService.getTasks(params);
      setTasks(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Failed to load task history');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, sortOrder]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchTasks(1);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [fetchTasks]);

  const calculateDuration = (started, completed) => {
    if (!started || !completed) return '—';
    const ms = new Date(completed).getTime() - new Date(started).getTime();
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="pb-6 border-b border-surface-border">
        <h1 className="text-2xl font-bold text-content-primary tracking-tight">Task History</h1>
        <p className="text-xs text-content-secondary mt-0.5">
          Browse, inspect, and analyze all past text processing executions
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-surface-border shadow-sm">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-content-muted">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks by title..."
            className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-surface-bg border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand text-content-primary"
          />
        </div>

        {/* Status Filter Tabs & Sort Toggle */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center space-x-1 bg-surface-bg p-1 rounded-lg border border-surface-border text-xs">
            {['', 'pending', 'running', 'success', 'failed'].map((st) => (
              <button
                key={st || 'all'}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md font-medium capitalize transition-colors ${
                  statusFilter === st
                    ? 'bg-white text-brand shadow-xs font-semibold'
                    : 'text-content-secondary hover:text-content-primary'
                }`}
              >
                {st || 'All'}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
            title="Toggle sort order"
            className="p-1.5 rounded-lg border border-surface-border bg-white text-content-secondary hover:text-content-primary hover:bg-slate-50 transition-colors"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Task Table */}
      <div className="mt-4 bg-white rounded-xl border border-surface-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-content-secondary">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand" />
            <span className="text-xs">Fetching task records...</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-16 text-center">
            <Layers className="w-8 h-8 mx-auto text-content-muted mb-2" />
            <h3 className="text-sm font-medium text-content-primary">No tasks match filter</h3>
            <p className="text-xs text-content-secondary mt-1">Try modifying your search or status criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-surface-border text-[11px] font-semibold text-content-secondary uppercase tracking-wider">
                  <th className="px-6 py-3.5">Task Title</th>
                  <th className="px-6 py-3.5">Operation</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Duration</th>
                  <th className="px-6 py-3.5">Created At</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border text-sm">
                {tasks.map((t) => (
                  <tr key={t.taskId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        to={`/tasks/${t.taskId}`}
                        className="font-medium text-content-primary hover:text-brand transition-colors line-clamp-1"
                      >
                        {t.title}
                      </Link>
                      <span className="font-mono text-[11px] text-content-muted block mt-0.5">
                        ID: {t.taskId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-content-secondary">
                        {t.operation}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-content-secondary">
                      {calculateDuration(t.startedAt, t.completedAt)}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-content-secondary">
                      {new Date(t.createdAt).toLocaleString([], {
                        dateStyle: 'short',
                        timeStyle: 'medium'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/tasks/${t.taskId}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-brand hover:text-white hover:bg-brand rounded-lg transition-colors border border-brand/20 hover:border-brand"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-3.5 bg-slate-50/50 border-t border-surface-border flex items-center justify-between text-xs text-content-secondary">
            <span>
              Showing page <strong className="text-content-primary">{pagination.currentPage}</strong> of{' '}
              <strong className="text-content-primary">{pagination.totalPages}</strong> ({pagination.totalTasks} tasks)
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => fetchTasks(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md border border-surface-border bg-white text-content-secondary hover:text-content-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <button
                onClick={() => fetchTasks(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md border border-surface-border bg-white text-content-secondary hover:text-content-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TaskHistoryPage;
