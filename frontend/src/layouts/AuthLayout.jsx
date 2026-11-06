import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Cross, ShieldCheck, HeartPulse, CheckCircle2 } from 'lucide-react';

export const AuthLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Branding Hero (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 p-12 text-white relative overflow-hidden">
        {/* Decorative backdrop glow */}
        <div className="absolute top-0 -left-20 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30">
            <Cross className="w-6 h-6 rotate-45" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              MediStock <span className="text-sky-400 font-extrabold">Pro</span>
            </h1>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Hospital Stock Management System
            </p>
          </div>
        </div>

        {/* Center Highlights */}
        <div className="my-auto max-w-lg relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold border border-sky-400/30">
            <HeartPulse className="w-4 h-4" />
            <span>Healthcare Logistics & Pharmacy Control</span>
          </div>

          <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-white">
            Precision Inventory for Critical Hospital Operations
          </h2>

          <p className="text-slate-300 text-base leading-relaxed">
            Real-time medicine tracking, automated stock alerts, expiry safeguards, and streamlined replenishment workflows across all hospital departments.
          </p>

          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-3 text-sm text-slate-200">
              <CheckCircle2 className="w-5 h-5 text-sky-400 flex-shrink-0" />
              <span>Real-time MongoDB Atlas synchronized stock balance</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-200">
              <CheckCircle2 className="w-5 h-5 text-sky-400 flex-shrink-0" />
              <span>Automatic low-stock threshold triggers & alerts</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-200">
              <CheckCircle2 className="w-5 h-5 text-sky-400 flex-shrink-0" />
              <span>Expiry quarantine & usable batch calculations</span>
            </div>
          </div>
        </div>

        {/* Bottom Security Note */}
        <div className="flex items-center gap-2 text-xs text-slate-400 relative z-10">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Role-Based Access Control • HIPAA & Medical Inventory Compliant</span>
        </div>
      </div>

      {/* Right Content Form Container */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
