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
  ArrowRight,
  Loader2,
  Clock,
  Layers,
  X,
  History,
  Sparkles
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
      {/* Page Title */}
      <div className="pb-6 border-b border-slate-200 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Execution Audit History</h1>
            <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
              {pagination.totalTasks} total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter, and inspect past asynchronous text-processing runs
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-900 placeholder:text-slate-400 font-medium transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs & Sort Toggle */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
            {[
              { id: '', label: 'All' },
              { id: 'pending', label: 'Pending' },
              { id: 'running', label: 'Running' },
              { id: 'success', label: 'Success' },
              { id: 'failed', label: 'Failed' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  statusFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
            title={`Sort order: ${sortOrder.toUpperCase()}`}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Task Table */}
      <div className="mt-4 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-20 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <span className="text-xs font-medium">Loading task logs...</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-20 text-center">
            <History className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No matching tasks</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No tasks matched your current search and filter combination.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Task Details</th>
                  <th className="px-6 py-4">Operation</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Execution Time</th>
                  <th className="px-6 py-4">Submitted At</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {tasks.map((t) => (
                  <tr key={t.taskId} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <Link
                        to={`/tasks/${t.taskId}`}
                        className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 text-sm"
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
                    <td className="px-6 py-4 font-mono text-[11px] font-semibold text-slate-600">
                      {calculateDuration(t.startedAt, t.completedAt)}
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-500">
                      {new Date(t.createdAt).toLocaleString([], {
                        dateStyle: 'short',
                        timeStyle: 'medium'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/tasks/${t.taskId}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all border border-blue-200 hover:border-blue-600 shadow-2xs"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
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
          <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing page <strong className="text-slate-900 font-bold">{pagination.currentPage}</strong> of{' '}
              <strong className="text-slate-900 font-bold">{pagination.totalPages}</strong> ({pagination.totalTasks} total tasks)
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => fetchTasks(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:text-slate-900 font-semibold disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <button
                onClick={() => fetchTasks(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:text-slate-900 font-semibold disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
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
