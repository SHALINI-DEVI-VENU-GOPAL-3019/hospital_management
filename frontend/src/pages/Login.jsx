import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle, Sparkles } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Login failed. Please verify credentials.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick fill helper for testing
  const fillDemo = (role) => {
    if (role === 'admin') {
      setEmail('admin@hospital.com');
      setPassword('admin123');
    } else {
      setEmail('staff@hospital.com');
      setPassword('staff123');
    }
    setError('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Sign In to MediStock
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Enter your hospital staff credentials to access the inventory system
        </p>
      </div>

      {/* Demo Credentials Quick-Fill Banner */}
      <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-3.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-900 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>Quick Demo Access (One-Click Fill):</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fillDemo('admin')}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-sky-200 text-sky-700 hover:bg-sky-100/50 transition-colors shadow-2xs"
          >
            👨‍⚕️ Admin: admin@hospital.com
          </button>
          <button
            type="button"
            onClick={() => fillDemo('staff')}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-sky-200 text-sky-700 hover:bg-sky-100/50 transition-colors shadow-2xs"
          >
            📋 Staff: staff@hospital.com
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. staff@hospital.com"
              required
              className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-sky-600 hover:bg-sky-700 focus:ring-4 focus:ring-sky-100 shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Sign In to Dashboard
            </>
          )}
        </button>
      </form>

      {/* Footer link */}
      <div className="text-center pt-2">
        <p className="text-xs text-slate-500">
          Need a new staff account?{' '}
          <Link
            to="/register"
            className="font-bold text-sky-600 hover:text-sky-700 hover:underline"
          >
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
