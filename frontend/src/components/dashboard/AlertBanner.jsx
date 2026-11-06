import React from 'react';
import { AlertTriangle, Clock, ArrowRight, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AlertBanner = ({ alerts = {}, onOpenStockIn }) => {
  const lowStock = alerts.lowStock || [];
  const nearingExpiry = alerts.nearingExpiry || [];
  const expired = alerts.expired || [];

  if (lowStock.length === 0 && nearingExpiry.length === 0 && expired.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* 1. Low Stock Alerts */}
      {lowStock.length > 0 && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50/70 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-orange-800 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <span>Low Stock Alerts ({lowStock.length})</span>
            </div>
            <Link
              to="/inventory?status=low-stock"
              className="text-xs text-orange-700 font-semibold hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-1.5 mt-2">
            {lowStock.slice(0, 3).map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between bg-white/80 px-2.5 py-1.5 rounded-lg border border-orange-200/60 text-xs"
              >
                <span className="font-semibold text-slate-800 truncate mr-2">
                  {item.name}
                </span>
                <span className="font-bold text-orange-600 flex-shrink-0">
                  {item.quantity} / min {item.minimumStockLevel}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Expiring Soon Alerts */}
      {nearingExpiry.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Nearing Expiry ({nearingExpiry.length})</span>
            </div>
            <Link
              to="/expiry"
              className="text-xs text-amber-700 font-semibold hover:underline flex items-center gap-1"
            >
              Track <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-1.5 mt-2">
            {nearingExpiry.slice(0, 3).map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between bg-white/80 px-2.5 py-1.5 rounded-lg border border-amber-200/60 text-xs"
              >
                <span className="font-semibold text-slate-800 truncate mr-2">
                  {item.name}
                </span>
                <span className="font-bold text-amber-700 flex-shrink-0">
                  {new Date(item.expiryDate).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Expired Stock Alert */}
      {expired.length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Quarantined / Expired ({expired.length})</span>
            </div>
            <Link
              to="/expiry"
              className="text-xs text-rose-700 font-semibold hover:underline flex items-center gap-1"
            >
              Action <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-1.5 mt-2">
            {expired.slice(0, 3).map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between bg-white/80 px-2.5 py-1.5 rounded-lg border border-rose-200/60 text-xs"
              >
                <span className="font-semibold text-slate-800 truncate mr-2">
                  {item.name}
                </span>
                <span className="font-bold text-rose-600 flex-shrink-0">
                  Expired
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertBanner;
