import React, { useState, useEffect } from 'react';
import reportService from '../services/reportService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import Toast from '../components/common/Toast';

import {
  FileSpreadsheet,
  Printer,
  Download,
  Search,
  Filter,
  Package,
  AlertTriangle,
  ShieldAlert,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export const Reports = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [toast, setToast] = useState(null);

  const fetchReport = async () => {
    try {
      setLoading(true);
      let res;
      if (activeTab === 'inventory') {
        res = await reportService.getInventoryReport({
          search: searchTerm,
          category: categoryFilter,
        });
      } else if (activeTab === 'low-stock') {
        res = await reportService.getLowStockReport();
      } else if (activeTab === 'expired') {
        res = await reportService.getExpiredReport(60);
      } else if (activeTab === 'stock-in') {
        res = await reportService.getTransactionReport({ type: 'STOCK_IN' });
      } else if (activeTab === 'stock-out') {
        res = await reportService.getTransactionReport({ type: 'STOCK_OUT' });
      }

      if (res && res.success) {
        setReportData(res);
      }
    } catch (err) {
      console.error('Failed to load report:', err);
      setToast({
        type: 'error',
        message: 'Failed to generate report from MongoDB Atlas database.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReport();
  };

  const handlePrint = () => {
    window.print();
  };

  // CSV Export for active report
  const handleExportCSV = () => {
    if (!reportData) return;

    let headers = [];
    let rows = [];
    const dateStr = new Date().toISOString().split('T')[0];
    let fileName = `hospital_report_${activeTab}_${dateStr}.csv`;

    if (activeTab === 'inventory') {
      headers = [
        'Product ID',
        'Name',
        'Category',
        'Quantity',
        'Unit',
        'Unit Price',
        'Total Valuation',
        'Status',
        'Supplier',
        'Mfg Date',
        'Expiry Date',
      ];
      rows = (reportData.data || []).map((p) => [
        p.productId,
        `"${p.name.replace(/"/g, '""')}"`,
        p.category,
        p.quantity,
        p.unit,
        p.unitPrice,
        p.totalValuation,
        p.status,
        `"${(p.supplierName || '').replace(/"/g, '""')}"`,
        p.manufacturingDate ? new Date(p.manufacturingDate).toISOString().split('T')[0] : '',
        p.expiryDate ? new Date(p.expiryDate).toISOString().split('T')[0] : '',
      ]);
    } else if (activeTab === 'low-stock') {
      headers = [
        'Product ID',
        'Name',
        'Category',
        'Current Stock',
        'Minimum Threshold',
        'Units Needed to Reorder',
        'Supplier',
        'Location',
      ];
      rows = (reportData.data || []).map((p) => [
        p.productId,
        `"${p.name.replace(/"/g, '""')}"`,
        p.category,
        p.quantity,
        p.minimumStockLevel,
        Math.max(0, p.minimumStockLevel - p.quantity),
        `"${(p.supplierName || '').replace(/"/g, '""')}"`,
        `"${(p.location || '').replace(/"/g, '""')}"`,
      ]);
    } else if (activeTab === 'expired') {
      const expiredItems = reportData.data?.expired || [];
      const soonItems = reportData.data?.expiringSoon || [];
      headers = [
        'Status',
        'Product ID',
        'Name',
        'Category',
        'Quantity',
        'Unit Price',
        'Estimated Loss / Value',
        'Expiry Date',
        'Batch',
      ];
      rows = [
        ...expiredItems.map((p) => [
          'Expired / Quarantined',
          p.productId,
          `"${p.name.replace(/"/g, '""')}"`,
          p.category,
          p.quantity,
          p.unitPrice,
          (p.quantity * p.unitPrice).toFixed(2),
          new Date(p.expiryDate).toISOString().split('T')[0],
          p.batchNumber || '',
        ]),
        ...soonItems.map((p) => [
          'Nearing Expiry',
          p.productId,
          `"${p.name.replace(/"/g, '""')}"`,
          p.category,
          p.quantity,
          p.unitPrice,
          (p.quantity * p.unitPrice).toFixed(2),
          new Date(p.expiryDate).toISOString().split('T')[0],
          p.batchNumber || '',
        ]),
      ];
    } else if (activeTab === 'stock-in' || activeTab === 'stock-out') {
      headers = [
        'Date & Time',
        'Type',
        'Product ID',
        'Product Name',
        'Quantity',
        'Source / Recipient',
        'Reference #',
        'Authorized By',
      ];
      rows = (reportData.data || []).map((t) => [
        new Date(t.createdAt).toISOString(),
        t.type,
        t.productId,
        `"${t.productName.replace(/"/g, '""')}"`,
        t.quantity,
        `"${(t.recipientOrSource || '').replace(/"/g, '""')}"`,
        t.referenceNumber || '',
        `"${(t.performedByName || '').replace(/"/g, '""')}"`,
      ]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const summary = reportData?.summary || {};

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

      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Hospital Inventory Reports & Audit
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Downloadable audit ledger, inventory valuations, stock deficit forecasts, and printable records
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all print-include"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Tab Selector (Hidden during printing) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm no-print">
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'inventory', label: 'Complete Inventory', icon: Package },
            { id: 'low-stock', label: 'Low-Stock Deficit', icon: AlertTriangle },
            { id: 'expired', label: 'Expiry & Quarantine', icon: ShieldAlert },
            { id: 'stock-in', label: 'Stock-In Inbound', icon: ArrowDownLeft },
            { id: 'stock-out', label: 'Stock-Out Outbound', icon: ArrowUpRight },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Print Document Header (Visible only on print or document top) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="border-b border-slate-200 pb-4 mb-4 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-wide">
              Hospital Stock Management System
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Official Medical Supply Inventory & Audit Ledger
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p className="font-bold text-slate-800">
              Report: {activeTab.toUpperCase().replace('-', ' ')}
            </p>
            <p className="mt-0.5">Generated: {new Date().toLocaleString()}</p>
          </div>
        </div>

        {/* Dynamic Summary Cards for Active Report */}
        {activeTab === 'inventory' && (
          <div className="grid grid-cols-3 gap-3 mb-6 p-4 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs">
            <div>
              <p className="text-slate-500 font-semibold uppercase text-[10px]">Total Products</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">
                {summary.totalItems || 0} SKUs
              </p>
            </div>
            <div>
              <p className="text-slate-500 font-semibold uppercase text-[10px]">Total Physical Items</p>
              <p className="text-lg font-bold text-sky-700 mt-0.5">
                {(summary.totalQuantity || 0).toLocaleString()} Units
              </p>
            </div>
            <div>
              <p className="text-slate-500 font-semibold uppercase text-[10px]">Inventory Capital Value</p>
              <p className="text-lg font-extrabold text-emerald-700 mt-0.5">
                ${(summary.totalValue || 0).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'low-stock' && (
          <div className="grid grid-cols-3 gap-3 mb-6 p-4 rounded-xl bg-orange-50/70 border border-orange-200 text-center text-xs">
            <div>
              <p className="text-orange-700 font-semibold uppercase text-[10px]">Low Stock SKUs</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">
                {summary.totalLowStockProducts || 0}
              </p>
            </div>
            <div>
              <p className="text-orange-700 font-semibold uppercase text-[10px]">Critical (0 Stock)</p>
              <p className="text-lg font-extrabold text-rose-600 mt-0.5">
                {summary.criticalItemsCount || 0}
              </p>
            </div>
            <div>
              <p className="text-orange-700 font-semibold uppercase text-[10px]">Total Reorder Units Needed</p>
              <p className="text-lg font-extrabold text-orange-700 mt-0.5">
                {summary.totalReorderUnitsNeeded || 0} Units
              </p>
            </div>
          </div>
        )}

        {activeTab === 'expired' && (
          <div className="grid grid-cols-3 gap-3 mb-6 p-4 rounded-xl bg-rose-50/70 border border-rose-200 text-center text-xs">
            <div>
              <p className="text-rose-700 font-semibold uppercase text-[10px]">Expired Batches</p>
              <p className="text-lg font-bold text-rose-700 mt-0.5">
                {summary.expiredCount || 0} ({summary.expiredUnits || 0} units)
              </p>
            </div>
            <div>
              <p className="text-rose-700 font-semibold uppercase text-[10px]">Loss from Expired Stock</p>
              <p className="text-lg font-extrabold text-rose-700 mt-0.5">
                ${(summary.expiredValueLoss || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-amber-700 font-semibold uppercase text-[10px]">Expiring Soon at Risk</p>
              <p className="text-lg font-extrabold text-amber-700 mt-0.5">
                ${(summary.atRiskValue || 0).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {(activeTab === 'stock-in' || activeTab === 'stock-out') && (
          <div className="grid grid-cols-3 gap-3 mb-6 p-4 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs">
            <div>
              <p className="text-slate-500 font-semibold uppercase text-[10px]">Total Entries</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">
                {summary.totalTransactions || 0} Operations
              </p>
            </div>
            <div>
              <p className="text-slate-500 font-semibold uppercase text-[10px]">Volume Moved</p>
              <p className="text-lg font-extrabold text-sky-700 mt-0.5">
                {(summary.totalQuantity || 0).toLocaleString()} Units
              </p>
            </div>
            <div>
              <p className="text-slate-500 font-semibold uppercase text-[10px]">Total Transaction Value</p>
              <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                ${(summary.totalAmount || 0).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Report Content Table */}
        {loading ? (
          <LoadingSpinner text="Compiling hospital report..." />
        ) : (
          <div className="overflow-x-auto print-table">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  {activeTab === 'inventory' && (
                    <>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">Product Name</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Quantity</th>
                      <th className="py-2.5 px-3">Unit Price</th>
                      <th className="py-2.5 px-3">Total Value</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Supplier</th>
                    </>
                  )}
                  {activeTab === 'low-stock' && (
                    <>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">Product Name</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Available</th>
                      <th className="py-2.5 px-3">Min Level</th>
                      <th className="py-2.5 px-3">Reorder Deficit</th>
                      <th className="py-2.5 px-3">Supplier</th>
                      <th className="py-2.5 px-3">Storage Location</th>
                    </>
                  )}
                  {activeTab === 'expired' && (
                    <>
                      <th className="py-2.5 px-3">Classification</th>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">Product Name</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Quantity</th>
                      <th className="py-2.5 px-3">Expiry Date</th>
                      <th className="py-2.5 px-3">Estimated Loss</th>
                    </>
                  )}
                  {(activeTab === 'stock-in' || activeTab === 'stock-out') && (
                    <>
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">Product Name</th>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">Quantity</th>
                      <th className="py-2.5 px-3">Recipient / Source</th>
                      <th className="py-2.5 px-3">Reference #</th>
                      <th className="py-2.5 px-3">Staff</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeTab === 'inventory' &&
                  (reportData?.data || []).map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-sky-700">
                        {p.productId}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {p.name}
                      </td>
                      <td className="py-2.5 px-3">{p.category}</td>
                      <td className="py-2.5 px-3 font-bold">
                        {p.quantity} {p.unit}
                      </td>
                      <td className="py-2.5 px-3">${Number(p.unitPrice).toFixed(2)}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-700">
                        ${Number(p.totalValuation).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {p.supplierName || 'General'}
                      </td>
                    </tr>
                  ))}

                {activeTab === 'low-stock' &&
                  (reportData?.data || []).map((p) => (
                    <tr key={p._id} className="hover:bg-orange-50/40">
                      <td className="py-2.5 px-3 font-mono font-bold text-orange-700">
                        {p.productId}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {p.name}
                      </td>
                      <td className="py-2.5 px-3">{p.category}</td>
                      <td className="py-2.5 px-3 font-extrabold text-rose-600">
                        {p.quantity} {p.unit}
                      </td>
                      <td className="py-2.5 px-3 font-semibold">{p.minimumStockLevel}</td>
                      <td className="py-2.5 px-3 font-bold text-orange-600">
                        +{Math.max(0, p.minimumStockLevel - p.quantity)} {p.unit}
                      </td>
                      <td className="py-2.5 px-3">{p.supplierName || 'General'}</td>
                      <td className="py-2.5 px-3 font-medium">{p.location}</td>
                    </tr>
                  ))}

                {activeTab === 'expired' && (
                  <>
                    {(reportData?.data?.expired || []).map((p) => (
                      <tr key={p._id} className="bg-rose-50/50 hover:bg-rose-50">
                        <td className="py-2.5 px-3 font-bold text-rose-700">
                          Quarantined / Expired
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold">{p.productId}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{p.name}</td>
                        <td className="py-2.5 px-3">{p.category}</td>
                        <td className="py-2.5 px-3 font-bold text-rose-600">
                          {p.quantity} {p.unit}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-rose-700">
                          {new Date(p.expiryDate).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-rose-700">
                          ${(p.quantity * p.unitPrice).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    {(reportData?.data?.expiringSoon || []).map((p) => (
                      <tr key={p._id} className="hover:bg-amber-50/40">
                        <td className="py-2.5 px-3 font-bold text-amber-700">
                          Expiring Soon
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold">{p.productId}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{p.name}</td>
                        <td className="py-2.5 px-3">{p.category}</td>
                        <td className="py-2.5 px-3 font-bold">
                          {p.quantity} {p.unit}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-amber-700">
                          {new Date(p.expiryDate).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">
                          ${(p.quantity * p.unitPrice).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </>
                )}

                {(activeTab === 'stock-in' || activeTab === 'stock-out') &&
                  (reportData?.data || []).map((t) => (
                    <tr key={t._id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-medium text-slate-500 whitespace-nowrap">
                        {new Date(t.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {t.productName}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-sky-700">
                        {t.productId}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {t.quantity}
                      </td>
                      <td className="py-2.5 px-3">{t.recipientOrSource}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        {t.referenceNumber || 'N/A'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{t.performedByName}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between text-[11px] text-slate-400">
          <span>MediStock Pro • Hospital Inventory Control System</span>
          <span>Verified Healthcare Audit Record</span>
        </div>
      </div>
    </div>
  );
};

export default Reports;
