import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { taskService } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
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
    }, 250);

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
      <div className="pb-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Task History</h1>
            <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {pagination.totalTasks} total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit log of all background asynchronous processing executions
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title..."
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-blue-600 text-slate-900 placeholder:text-slate-400 font-medium"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs & Sort Toggle */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-xs">
            {[
              { id: '', label: 'All' },
              { id: 'pending', label: 'Pending' },
              { id: 'running', label: 'Running' },
              { id: 'success', label: 'Success' },
              { id: 'failed', label: 'Failed' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
            title={`Sort order: ${sortOrder.toUpperCase()}`}
            className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Task Table */}
      <div className="mt-4 bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
            <span className="text-xs">Loading tasks...</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-16 text-center">
            <Layers className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-xs text-slate-500">No matching tasks found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Task Details</th>
                  <th className="px-5 py-3">Operation</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Duration</th>
                  <th className="px-5 py-3">Submitted</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map((t) => (
                  <tr key={t.taskId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link
                        to={`/tasks/${t.taskId}`}
                        className="font-medium text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
                      >
                        {t.title}
                      </Link>
                      <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
                        ID: {t.taskId}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {t.operation}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={t.status} size="xs" />
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600">
                      {calculateDuration(t.startedAt, t.completedAt)}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500">
                      {new Date(t.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric'
                      })}{' '}
                      {new Date(t.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
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

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => fetchTasks(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                className="p-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => fetchTasks(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="p-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TaskHistoryPage;
