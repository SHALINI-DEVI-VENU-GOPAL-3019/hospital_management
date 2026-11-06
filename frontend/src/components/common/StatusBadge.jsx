import React from 'react';

export const StatusBadge = ({ status, variant }) => {
  // Normalize status text
  const text = status || '';

  if (variant === 'transaction' || text === 'STOCK_IN' || text === 'STOCK_OUT') {
    if (text === 'STOCK_IN') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
          Stock In
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
        Stock Out
      </span>
    );
  }

  // Stock / Expiry status badges
  switch (text.toLowerCase()) {
    case 'expired':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mr-1.5 animate-pulse"></span>
          Expired
        </span>
      );
    case 'expiring soon':
    case 'expiring-soon':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
          Expiring Soon
        </span>
      );
    case 'low stock':
    case 'low-stock':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-300">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1.5"></span>
          Low Stock
        </span>
      );
    case 'out of stock':
    case 'out-of-stock':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1.5"></span>
          Out of Stock
        </span>
      );
    case 'in stock':
    case 'adequate':
    case 'healthy':
    case 'active':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
          {text === 'healthy' ? 'In Stock' : text}
        </span>
      );
    case 'inactive':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-300">
          Inactive
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
          {text}
        </span>
      );
  }
};

export default StatusBadge;
