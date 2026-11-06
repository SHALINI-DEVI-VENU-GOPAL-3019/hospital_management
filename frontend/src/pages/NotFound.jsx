import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900">404 - Page Not Found</h1>
      <p className="mt-2 text-sm text-slate-500 max-w-md">
        The hospital management page or clinical record you are searching for does not exist or has been relocated.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-700 shadow-sm transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
