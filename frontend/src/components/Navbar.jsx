import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { healthService } from '../services/api';
import {
  Cpu,
  LayoutDashboard,
  History,
  PlusCircle,
  LogOut,
  Radio,
  CheckCircle,
  Sparkles,
  Layers
} from 'lucide-react';

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
    const interval = setInterval(checkHealth, 25000);
    return () => clearInterval(interval);
  }, []);

  const isActive = (path) => location.pathname === path;

  // Extract initials for avatar
  const getInitials = (name) => {
    if (!name) return 'AI';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0F172A] border-b border-slate-800/80 shadow-md backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 ring-1 ring-white/20 group-hover:scale-105 transition-all">
                <Cpu className="w-5 h-5" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-white group-hover:text-blue-200 transition-colors">
                  AI Task Platform
                </span>
                <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase flex items-center gap-1">
                  <span>Async Queue Engine</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-blue-400 font-semibold">v1.0</span>
                </span>
              </div>
            </Link>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-1.5">
              <Link
                to="/dashboard"
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive('/dashboard')
                    ? 'bg-slate-800 text-white shadow-xs ring-1 ring-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-blue-400" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/tasks"
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive('/tasks')
                    ? 'bg-slate-800 text-white shadow-xs ring-1 ring-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <History className="w-4 h-4 text-indigo-400" />
                <span>Task History</span>
              </Link>
            </nav>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3.5">
            {/* Real-Time Cluster Health Indicator */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800/70 border border-slate-700/60 text-xs shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${systemReady ? 'bg-emerald-400 animate-ping' : 'bg-red-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${systemReady ? 'bg-emerald-400' : 'bg-red-500'}`}></span>
              </span>
              <span className="text-slate-300 font-mono text-[11px]">
                {systemReady ? 'Redis Streams Online' : 'Service Warning'}
              </span>
            </div>

            {/* Create Task Button with Shortcut hint */}
            <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>

            {/* User Profile Avatar & Logout */}
            <div className="flex items-center space-x-3 border-l border-slate-800 pl-3.5">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 text-white font-bold text-xs flex items-center justify-center ring-1 ring-slate-600/80 shadow-xs">
                  {getInitials(user?.name)}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold text-white leading-tight">{user?.name || 'Developer'}</span>
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">{user?.email}</span>
                </div>
              </div>

              <button
                onClick={logout}
                title="Sign out of account"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
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
