import React from 'react';
import { StatusBadge } from '../common/StatusBadge';
import { ArrowUpRight, ArrowDownLeft, Clock, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RecentActivities = ({ activities = [] }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Recent Stock Activities</h3>
          <p className="text-xs text-slate-500">
            Latest recorded stock-in arrivals and ward dispatch transactions
          </p>
        </div>
        <Link
          to="/stock"
          className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline"
        >
          View All History &rarr;
        </Link>
      </div>

      {activities.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          No stock transactions recorded yet.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {activities.map((tx) => {
            const isStockIn = tx.type === 'STOCK_IN';
            const dateStr = new Date(tx.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={tx._id}
                className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isStockIn
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}
                  >
                    {isStockIn ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {tx.productName}
                    </p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                      <span className="font-mono text-slate-500">{tx.productId}</span>
                      <span>•</span>
                      <span>{tx.recipientOrSource || 'General'}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span
                    className={`text-xs font-bold ${
                      isStockIn ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    {isStockIn ? '+' : '-'}
                    {tx.quantity}
                  </span>
                  <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 mt-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{dateStr}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentActivities;
