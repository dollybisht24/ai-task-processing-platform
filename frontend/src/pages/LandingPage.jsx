import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, ArrowRight, Layers, ShieldCheck, Zap, Server, Activity, Terminal } from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-surface-bg flex flex-col">
      {/* Top Navigation */}
      <nav className="border-b border-surface-border bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-navy flex items-center justify-center text-white shadow-sm">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-navy tracking-tight">AI Task Processing Platform</span>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-content-primary hover:text-brand transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white text-sm font-medium shadow-sm transition-all"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-light border border-blue-200 text-brand text-xs font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>
          <span>Distributed Python Background Worker Cluster</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-navy tracking-tight leading-tight">
          Asynchronous AI Text Processing <br className="hidden sm:inline" />
          <span className="text-brand">Engineered for Scale</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-content-secondary max-w-3xl mx-auto leading-relaxed">
          Decouple high-throughput compute workloads with an enterprise distributed architecture.
          Submit text-processing jobs through Express APIs, buffer via Redis Streams, and execute concurrently with Python workers.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-lg bg-navy hover:bg-navy-dark text-white font-medium shadow-md transition-all"
          >
            <span>Start Processing Tasks</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-lg bg-white border border-surface-border hover:bg-slate-50 text-content-primary font-medium shadow-sm transition-colors"
          >
            <span>Live System Demo</span>
          </Link>
        </div>
      </section>

      {/* Architecture Highlights */}
      <section className="py-16 bg-white border-y border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand">Core System Capabilities</h2>
            <p className="text-2xl font-bold text-navy mt-1">Built with Production Architecture Standards</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-surface-border bg-surface-bg/50 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-brand flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-content-primary mb-2">Redis Streams Queuing</h3>
              <p className="text-sm text-content-secondary leading-relaxed">
                Consumer group message distribution with explicit acknowledgments (<code className="text-xs bg-slate-200 px-1 py-0.5 rounded">XACK</code>) and automatic dead-worker stalled task recovery (<code className="text-xs bg-slate-200 px-1 py-0.5 rounded">XAUTOCLAIM</code>).
              </p>
            </div>

            <div className="p-6 rounded-xl border border-surface-border bg-surface-bg/50 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-content-primary mb-2">Python 3.12 Worker Cluster</h3>
              <p className="text-sm text-content-secondary leading-relaxed">
                Horizontally scalable compute pods executing uppercase, lowercase, string reversal, and word count algorithms with sub-millisecond precision and structured logging.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-surface-border bg-surface-bg/50 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-content-primary mb-2">Live Observability & Logs</h3>
              <p className="text-sm text-content-secondary leading-relaxed">
                Real-time status tracking from pending to running and success, complete with streaming timestamped audit logs, execution durations, and retry triggers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Flow */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand">Workflow Pipeline</h2>
          <p className="text-2xl font-bold text-navy mt-1">How Tasks Flow End-to-End</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Task Submission',
              desc: 'React dashboard sends authenticated payload to Express REST API with JWT security.'
            },
            {
              step: '02',
              title: 'Queue Buffering',
              desc: 'MongoDB persists initial status while job ID is pushed to Redis Stream consumer group.'
            },
            {
              step: '03',
              title: 'Worker Execution',
              desc: 'Python worker claims job, transitions state to running, and processes transformation.'
            },
            {
              step: '04',
              title: 'Result & Audit Logs',
              desc: 'Execution metrics, duration, logs, and outputs persist; dashboard updates live.'
            }
          ].map((item, idx) => (
            <div key={idx} className="relative p-6 rounded-xl bg-white border border-surface-border shadow-sm">
              <span className="font-mono text-xs font-bold text-brand bg-brand-light px-2.5 py-1 rounded-md">
                STEP {item.step}
              </span>
              <h3 className="text-base font-bold text-content-primary mt-3 mb-1.5">{item.title}</h3>
              <p className="text-xs text-content-secondary leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-surface-border bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-content-secondary gap-4">
          <span>AI Task Processing Platform &bull; MERN + Python Distributed Architecture</span>
          <div className="flex items-center space-x-6">
            <Link to="/login" className="hover:text-content-primary">Sign In</Link>
            <Link to="/register" className="hover:text-content-primary">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
