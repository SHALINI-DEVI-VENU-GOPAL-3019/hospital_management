import React, { useState, useEffect } from 'react';
import reportService from '../services/reportService';
import productService from '../services/productService';
import stockService from '../services/stockService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import Toast from '../components/common/Toast';
import StockInModal from '../components/stock/StockInModal';
import ConfirmDialog from '../components/common/ConfirmDialog';

import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowDownLeft,
  Trash2,
  RefreshCw,
  Info,
  DollarSign,
} from 'lucide-react';

export const ExpiryManagement = () => {
  const [reportData, setReportData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Time window for "nearing expiry" (30, 60, or 90 days)
  const [daysWindow, setDaysWindow] = useState(60);

  // Modals
  const [isStockInOpen, setIsStockInOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchExpiryData = async () => {
    try {
      setLoading(true);
      const [res, prodRes] = await Promise.all([
        reportService.getExpiredReport(daysWindow),
        productService.getProducts(),
      ]);

      if (res.success) {
        setReportData(res);
      }
      if (prodRes.success) {
        setProducts(prodRes.data);
      }
    } catch (err) {
      console.error('Failed to load expiry telemetry:', err);
      setToast({
        type: 'error',
        message: 'Failed to fetch expiry monitoring data from server.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpiryData();
  }, [daysWindow]);

  const handleStockInSubmit = async (formData) => {
    try {
      setActionLoading(true);
      const res = await stockService.stockIn(formData);
      if (res.success) {
        setToast({ type: 'success', message: res.message });
        setIsStockInOpen(false);
        fetchExpiryData();
      }
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Stock replenishment failed.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisposalConfirm = async () => {
    if (!selectedProduct) return;
    try {
      setActionLoading(true);
      const res = await productService.deleteProduct(selectedProduct._id);
      if (res.success) {
        setToast({
          type: 'success',
          message: `Quarantined product "${selectedProduct.name}" removed from database.`,
        });
        setIsDeleteOpen(false);
        setSelectedProduct(null);
        fetchExpiryData();
      }
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Disposal failed.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const summary = reportData?.summary || {};
  const expiredList = reportData?.data?.expired || [];
  const expiringSoonList = reportData?.data?.expiringSoon || [];

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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Expiry & Quarantine Tracking</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">
              Safety Control
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Safeguarding patients by quarantining expired batches and forecasting shelf-life risks
          </p>
        </div>

        {/* Threshold selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Alert Horizon:</span>
          <div className="flex rounded-xl border border-slate-200 bg-white p-1">
            {[30, 60, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDaysWindow(d)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                  daysWindow === d
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {d} Days
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Expired / Quarantined Card */}
        <div className="p-5 rounded-2xl bg-white border border-rose-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-rose-600">
                Expired Products
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {summary.expiredCount || 0} Items
              </h3>
              <p className="text-xs text-rose-600 font-semibold mt-1">
                {summary.expiredUnits || 0} Units Quarantined
              </p>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-rose-100 flex items-center justify-between text-xs text-slate-500">
            <span>Potential Value Loss:</span>
            <span className="font-bold text-rose-700">
              ${(summary.expiredValueLoss || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Nearing Expiry Card */}
        <div className="p-5 rounded-2xl bg-white border border-amber-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Expiring Soon (&lt; {daysWindow} Days)
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {summary.expiringSoonCount || 0} Items
              </h3>
              <p className="text-xs text-amber-600 font-semibold mt-1">
                {summary.expiringSoonUnits || 0} Units at Risk
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-amber-100 flex items-center justify-between text-xs text-slate-500">
            <span>Stock Value at Risk:</span>
            <span className="font-bold text-amber-700">
              ${(summary.atRiskValue || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Usable Stock Policy Banner */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-1.5">
              <Info className="w-4 h-4 text-sky-600" />
              <span>Safety Dispensing Protocol</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Expired medicines are automatically excluded from the "Available Usable Stock" calculation on the dashboard to prevent dangerous accidental ward dispatches.
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs font-semibold text-sky-700">
            Protocol: Immediate Quarantine & Replacement
          </div>
        </div>
      </div>

      {/* 1. Expired Products Table (Quarantined) */}
      <div className="rounded-2xl border border-rose-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 bg-rose-50/70 border-b border-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h3 className="text-sm font-bold text-rose-900">
              Quarantined / Expired Products (Do Not Dispense)
            </h3>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-800">
            {expiredList.length} items
          </span>
        </div>

        {expiredList.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-800 text-sm">
              No expired products found in hospital inventory!
            </p>
            <p className="mt-0.5">All active stock is within valid regulatory dates.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">SKU / ID</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Quarantined Qty</th>
                  <th className="py-3 px-4">Expired On</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expiredList.map((item) => {
                  const expDate = new Date(item.expiryDate);
                  const daysAgo = Math.abs(
                    Math.ceil((new Date() - expDate) / (1000 * 60 * 60 * 24))
                  );

                  return (
                    <tr key={item._id} className="hover:bg-rose-50/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-rose-700">
                        {item.productId}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Batch: {item.batchNumber || 'N/A'} • Loc: {item.location}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {item.category}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-rose-600">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-rose-600">
                          {expDate.toLocaleDateString()}
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          ({daysAgo} days ago)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {item.supplierName || 'General Store'}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedProduct(item);
                              setIsStockInOpen(true);
                            }}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors flex items-center gap-1"
                          >
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                            Restock Safe Batch
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProduct(item);
                              setIsDeleteOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 transition-colors"
                            title="Dispose & Clear from Database"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 2. Products Nearing Expiry Table */}
      <div className="rounded-2xl border border-amber-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 bg-amber-50/70 border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-bold text-amber-900">
              Products Nearing Expiry (Within Next {daysWindow} Days)
            </h3>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-800">
            {expiringSoonList.length} items
          </span>
        </div>

        {expiringSoonList.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            <p className="font-bold text-slate-800 text-sm">
              No products nearing expiry in the next {daysWindow} days!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">SKU / ID</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Days Left</th>
                  <th className="py-3 px-4 text-right">Replenish</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expiringSoonList.map((item) => {
                  const expDate = new Date(item.expiryDate);
                  const daysLeft = Math.ceil(
                    (expDate - new Date()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <tr key={item._id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {item.productId}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Batch: {item.batchNumber || 'N/A'} • Loc: {item.location}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {item.category}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-amber-700">
                        {expDate.toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                          {daysLeft} days left
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedProduct(item);
                            setIsStockInOpen(true);
                          }}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors inline-flex items-center gap-1"
                        >
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                          Stock In Fresh Batch
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stock In Modal */}
      <StockInModal
        isOpen={isStockInOpen}
        onClose={() => {
          setIsStockInOpen(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleStockInSubmit}
        products={products}
        selectedProduct={selectedProduct}
        loading={actionLoading}
      />

      {/* Disposal Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleDisposalConfirm}
        title="Quarantine Disposal Confirmation"
        message={`Confirm safe hospital incineration / medical disposal for expired item "${selectedProduct?.name}" (${selectedProduct?.quantity} ${selectedProduct?.unit})? This record will be permanently purged from the active catalog.`}
        confirmText="Confirm Disposal"
        type="danger"
        loading={actionLoading}
      />
    </div>
  );
};

export default ExpiryManagement;
