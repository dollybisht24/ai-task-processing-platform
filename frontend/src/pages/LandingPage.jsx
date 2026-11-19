import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Cpu,
  ArrowRight,
  Layers,
  Server,
  Activity,
  Terminal,
  Zap,
  CheckCircle2,
  Shield,
  Play,
  Copy,
  Check
} from 'lucide-react';

export const LandingPage = () => {
  const [demoInput, setDemoInput] = useState('Hello Dolly, Welcome to AI Platform!');
  const [demoOp, setDemoOp] = useState('UPPERCASE');
  const [copied, setCopied] = useState(false);

  // Compute live client preview
  const computePreview = () => {
    if (demoOp === 'UPPERCASE') return demoInput.toUpperCase();
    if (demoOp === 'LOWERCASE') return demoInput.toLowerCase();
    if (demoOp === 'REVERSE_STRING') return demoInput.split('').reverse().join('');
    if (demoOp === 'WORD_COUNT') return String(demoInput.trim() ? demoInput.trim().split(/\s+/).length : 0);
    return demoInput;
  };

  const copyDemo = () => {
    navigator.clipboard.writeText(computePreview());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <nav className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">AI Task Platform</span>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition-all active:scale-95"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
          <span>Distributed Python 3.12 Worker Engine • Redis Streams</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
          High-Throughput Asynchronous <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Text Processing Pipeline
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Decouple high-volume computational workloads from your web APIs. Queue jobs reliably via Redis Streams, process in parallel with Python worker replicas, and stream execution telemetry live.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
          >
            <span>Open Task Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm shadow-2xs transition-colors"
          >
            <span>Sign In to Account</span>
          </Link>
        </div>
      </section>

      {/* Interactive Live Demo Card */}
      <section className="max-w-4xl mx-auto px-4 pb-20 w-full">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
          {/* Card Topbar */}
          <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-400"></span>
              <span className="w-3 h-3 rounded-full bg-amber-400"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
              <span className="text-xs font-mono text-slate-500 ml-2 font-bold">Interactive Algorithm Benchmark</span>
            </div>
            <span className="text-[11px] font-mono text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
              Sub-5ms Execution
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Input field */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Input Text Payload
              </label>
              <input
                type="text"
                value={demoInput}
                onChange={(e) => setDemoInput(e.target.value)}
                className="w-full px-4 py-2.5 text-xs sm:text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Operation Selector Tabs */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2">
                Select Processing Algorithm
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'UPPERCASE', label: 'UPPERCASE' },
                  { id: 'LOWERCASE', label: 'LOWERCASE' },
                  { id: 'REVERSE_STRING', label: 'REVERSE STRING' },
                  { id: 'WORD_COUNT', label: 'WORD COUNT' }
                ].map((op) => (
                  <button
                    key={op.id}
                    onClick={() => setDemoOp(op.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold font-mono transition-all border ${
                      demoOp === op.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Output Box */}
            <div className="bg-[#0B132B] rounded-2xl p-5 border border-slate-800 text-slate-200">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2 pb-2 border-b border-slate-800">
                <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Output Telemetry</span>
                </span>
                <button
                  onClick={copyDemo}
                  className="inline-flex items-center space-x-1 text-slate-400 hover:text-white transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="font-mono text-sm text-emerald-400 break-words font-semibold">
                {computePreview()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Architecture Cards */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-black uppercase tracking-wider text-blue-600">Enterprise Ready</h2>
            <p className="text-2xl font-black text-slate-900 mt-1">Built to Production Engineering Standards</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Redis Streams Queuing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Consumer group message distribution with explicit acknowledgments (<code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">XACK</code>) and automatic dead-worker recovery (<code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">XAUTOCLAIM</code>).
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Python 3.12 Worker Cluster</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Horizontally scalable compute pods executing uppercase, lowercase, string reversal, and word count algorithms with sub-millisecond precision.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Live Telemetry & Logs</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Real-time status tracking from pending to running and success, complete with streaming timestamped audit logs, execution durations, and retry triggers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4 font-medium">
          <span>AI Task Processing Platform &bull; MERN + Python Async Engine</span>
          <div className="flex items-center space-x-6">
            <Link to="/login" className="hover:text-slate-900">Sign In</Link>
            <Link to="/register" className="hover:text-slate-900">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
