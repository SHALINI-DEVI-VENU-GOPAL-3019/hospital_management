import React, { useState, useEffect } from 'react';
import stockService from '../services/stockService';
import productService from '../services/productService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import Toast from '../components/common/Toast';
import StockInModal from '../components/stock/StockInModal';
import StockOutModal from '../components/stock/StockOutModal';

import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Search,
  Filter,
  Clock,
  Package,
  Calendar,
  Building2,
  FileText,
  User,
  Download,
  CheckCircle2,
} from 'lucide-react';

export const StockManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isStockInOpen, setIsStockInOpen] = useState(false);
  const [isStockOutOpen, setIsStockOutOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [txRes, prodRes] = await Promise.all([
        stockService.getStockHistory({
          type: typeFilter,
          category: categoryFilter,
          search: searchTerm,
        }),
        productService.getProducts(),
      ]);

      if (txRes.success) {
        setTransactions(txRes.data);
      }
      if (prodRes.success) {
        setProducts(prodRes.data);
      }
    } catch (err) {
      console.error('Failed to load stock data:', err);
      setToast({
        type: 'error',
        message: 'Failed to fetch stock transactions from database.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [typeFilter, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleStockInSubmit = async (formData) => {
    try {
      setActionLoading(true);
      const res = await stockService.stockIn(formData);
      if (res.success) {
        setToast({ type: 'success', message: res.message });
        setIsStockInOpen(false);
        fetchData();
      }
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Stock In failed.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStockOutSubmit = async (formData) => {
    try {
      setActionLoading(true);
      const res = await stockService.stockOut(formData);
      if (res.success) {
        setToast({ type: 'success', message: res.message });
        setIsStockOutOpen(false);
        fetchData();
      }
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Stock Out failed.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // CSV Export
  const exportTransactionsCSV = () => {
    if (transactions.length === 0) return;
    const headers = [
      'Transaction ID',
      'Date & Time',
      'Type',
      'Product ID',
      'Product Name',
      'Category',
      'Quantity',
      'Previous Stock',
      'New Stock',
      'Unit Price',
      'Total Value',
      'Source / Recipient',
      'Reference #',
      'Authorized By',
      'Notes',
    ];

    const rows = transactions.map((t) => [
      t._id,
      new Date(t.createdAt).toISOString(),
      t.type,
      t.productId,
      `"${t.productName.replace(/"/g, '""')}"`,
      t.category,
      t.quantity,
      t.previousStock,
      t.newStock,
      t.unitPrice || 0,
      t.totalValue || 0,
      `"${(t.recipientOrSource || '').replace(/"/g, '""')}"`,
      t.referenceNumber || '',
      `"${(t.performedByName || '').replace(/"/g, '""')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hospital_stock_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Summary counts
  const totalStockIn = transactions
    .filter((t) => t.type === 'STOCK_IN')
    .reduce((sum, t) => sum + t.quantity, 0);

  const totalStockOut = transactions
    .filter((t) => t.type === 'STOCK_OUT')
    .reduce((sum, t) => sum + t.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Stock In & Out Operations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log item replenishment receipts, ward dispatches, and audit trail records
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={exportTransactionsCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Log</span>
          </button>

          <button
            onClick={() => setIsStockInOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-sky-600 text-white hover:bg-sky-700 shadow-sm transition-all"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Receive Stock In</span>
          </button>

          <button
            onClick={() => setIsStockOutOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-amber-600 text-white hover:bg-amber-700 shadow-sm transition-all"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Issue Stock Out</span>
          </button>
        </div>
      </div>

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Inbound Received
            </p>
            <h3 className="text-2xl font-extrabold text-sky-700 mt-1">
              +{totalStockIn.toLocaleString()} Units
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Across all hospital deliveries
            </p>
          </div>
          <div className="p-3 rounded-xl bg-sky-50 text-sky-600">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Outbound Dispatched
            </p>
            <h3 className="text-2xl font-extrabold text-amber-700 mt-1">
              -{totalStockOut.toLocaleString()} Units
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Issued to wards & clinical units
            </p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Logged Transactions
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {transactions.length} Records
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Auditable timestamped movements
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-100 text-slate-700">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search transactions by product, reference #, department, or staff..."
              className="w-full pl-10 pr-20 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Filter
            </button>
          </form>

          {/* Type filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { label: 'All Transactions', value: 'ALL' },
              { label: 'Stock In Only', value: 'STOCK_IN' },
              { label: 'Stock Out Only', value: 'STOCK_OUT' },
            ].map((tp) => (
              <button
                key={tp.value}
                onClick={() => setTypeFilter(tp.value)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-colors ${
                  typeFilter === tp.value
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tp.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching stock audit ledger..." />
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-700 text-sm">
              No transactions recorded
            </p>
            <p className="mt-1">
              Use "Receive Stock In" or "Issue Stock Out" to perform your first inventory operation.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Stock Shift</th>
                  <th className="py-3 px-4">Source / Department</th>
                  <th className="py-3 px-4">Reference #</th>
                  <th className="py-3 px-4">Authorized By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => {
                  const isStockIn = tx.type === 'STOCK_IN';
                  const dateStr = new Date(tx.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr
                      key={tx._id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-medium">
                        {dateStr}
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={tx.type} variant="transaction" />
                      </td>

                      {/* Product Name & ID */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-bold text-slate-900 truncate">
                          {tx.productName}
                        </p>
                        <p className="text-[11px] font-mono text-slate-400">
                          {tx.productId} • {tx.category}
                        </p>
                      </td>

                      {/* Quantity */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`font-extrabold text-sm ${
                            isStockIn ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {isStockIn ? '+' : '-'}
                          {tx.quantity}
                        </span>
                      </td>

                      {/* Stock Shift (Previous -> New) */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-600">
                        <span>{tx.previousStock}</span>
                        <span className="mx-1 text-slate-400">&rarr;</span>
                        <span className="font-bold text-slate-900">
                          {tx.newStock}
                        </span>
                      </td>

                      {/* Source / Recipient */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-800 font-medium">
                        {tx.recipientOrSource || 'Central Store'}
                      </td>

                      {/* Reference # */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-500 text-[11px]">
                        {tx.referenceNumber || 'N/A'}
                      </td>

                      {/* Authorized By */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                        {tx.performedByName || 'Staff'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {transactions.length} transactions</span>
          <span className="font-medium">Immutable Stock Audit Log</span>
        </div>
      </div>

      {/* Stock In & Stock Out Modals */}
      <StockInModal
        isOpen={isStockInOpen}
        onClose={() => setIsStockInOpen(false)}
        onSubmit={handleStockInSubmit}
        products={products}
        loading={actionLoading}
      />

      <StockOutModal
        isOpen={isStockOutOpen}
        onClose={() => setIsStockOutOpen(false)}
        onSubmit={handleStockOutSubmit}
        products={products}
        loading={actionLoading}
      />
    </div>
  );
};

export default StockManagement;
