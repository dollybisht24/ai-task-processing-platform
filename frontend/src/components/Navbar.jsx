import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { healthService } from '../services/api';
import { Cpu, LayoutDashboard, History, PlusCircle, LogOut, CheckCircle, AlertCircle } from 'lucide-react';

export const Navbar = ({ onOpenCreateModal }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [systemReady, setSystemReady] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await healthService.getReady();
        setSystemReady(true);
      } catch (e) {
        setSystemReady(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-navy text-white border-b border-navy-light shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 rounded-lg bg-brand flex items-center justify-center text-white shadow-md shadow-brand/20 group-hover:bg-brand-hover transition-colors">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-white">AI Task Platform</span>
                <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Async Engine</span>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/dashboard"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-navy-light text-white'
                    : 'text-slate-300 hover:text-white hover:bg-navy-light/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/tasks"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/tasks')
                    ? 'bg-navy-light text-white'
                    : 'text-slate-300 hover:text-white hover:bg-navy-light/60'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Task History</span>
              </Link>
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-4">
            {/* System Status Indicator */}
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-navy-light/50 border border-slate-700/60 text-xs">
              <span className={`w-2 h-2 rounded-full ${systemReady ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
              <span className="text-slate-300">{systemReady ? 'Cluster Ready' : 'Service Warning'}</span>
            </div>

            {/* Run Task Button */}
            <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-brand hover:bg-brand-hover text-white text-sm font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-navy"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Task</span>
            </button>

            {/* User Profile & Logout */}
            <div className="flex items-center space-x-3 border-l border-slate-700/60 pl-4">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-semibold text-white">{user?.name || 'Developer'}</span>
                <span className="text-[11px] text-slate-400">{user?.email}</span>
              </div>

              <button
                onClick={logout}
                title="Logout"
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-navy-light transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
