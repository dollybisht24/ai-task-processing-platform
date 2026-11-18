import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Cpu, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      // Error handled by AuthContext toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center text-white shadow-md">
            <Cpu className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl text-navy tracking-tight">AI Task Platform</span>
        </Link>
        <h2 className="text-center text-2xl font-bold text-content-primary">
          Sign in to your account
        </h2>
        <p className="mt-1 text-center text-xs text-content-secondary">
          Access the distributed task queue and worker monitoring
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-surface-border rounded-xl sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-content-primary uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-content-muted">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="jane@company.com"
                  className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand text-content-primary placeholder:text-content-muted"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-primary uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-content-muted">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand text-content-primary placeholder:text-content-muted"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center space-x-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-content-secondary">
            <span>Don't have an account? </span>
            <Link to="/register" className="font-semibold text-brand hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
