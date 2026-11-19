import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { healthService } from '../services/api';
import {
  Layers,
  LayoutDashboard,
  ListFilter,
  Plus,
  LogOut,
  CheckCircle2
} from 'lucide-react';

export const Navbar = ({ onOpenCreateModal }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [systemReady, setSystemReady] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const checkHealth = async () => {
      try {
        await healthService.getReady();
        if (isMounted) setSystemReady(true);
      } catch (e) {
        if (isMounted) setSystemReady(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const isActive = (path) => location.pathname === path;

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          {/* Brand & Main Navigation */}
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-500 transition-colors">
                <Layers className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm tracking-tight text-white">
                AI Task Platform
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/dashboard"
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/tasks"
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isActive('/tasks')
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Tasks</span>
              </Link>
            </nav>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* System Status */}
            <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400 font-medium">
              <span className={`w-2 h-2 rounded-full ${systemReady ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span className="text-[11px]">{systemReady ? 'Systems Normal' : 'Degraded'}</span>
            </div>

            {/* New Task Action */}
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors focus:outline-none active:scale-98"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Task</span>
            </button>

            {/* User Profile */}
            <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-800">
              <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center border border-slate-700">
                {getInitials(user?.name)}
              </div>
              <span className="hidden lg:inline text-xs font-medium text-slate-300 max-w-[120px] truncate">
                {user?.name || 'Account'}
              </span>
              <button
                type="button"
                onClick={logout}
                title="Sign out"
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
