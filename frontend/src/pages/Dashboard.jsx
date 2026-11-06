import React, { useState, useEffect } from 'react';
import dashboardService from '../services/dashboardService';
import productService from '../services/productService';
import stockService from '../services/stockService';
import MetricCard from '../components/common/MetricCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Toast from '../components/common/Toast';
import StockLevelChart from '../components/dashboard/StockLevelChart';
import CategoryPieChart from '../components/dashboard/CategoryPieChart';
import RecentActivities from '../components/dashboard/RecentActivities';
import AlertBanner from '../components/dashboard/AlertBanner';
import ProductFormModal from '../components/inventory/ProductFormModal';
import StockInModal from '../components/stock/StockInModal';
import StockOutModal from '../components/stock/StockOutModal';

import {
  Package,
  Pill,
  Stethoscope,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isStockInOpen, setIsStockInOpen] = useState(false);
  const [isStockOutOpen, setIsStockOutOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const [statsRes, productsRes] = await Promise.all([
        dashboardService.getStats(),
        productService.getProducts(),
      ]);

      if (statsRes.success) {
        setData(statsRes);
      }
      if (productsRes.success) {
        setProducts(productsRes.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setToast({
        type: 'error',
        message: 'Failed to fetch dashboard metrics. Please verify backend connection.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Quick Action Handlers
  const handleAddProduct = async (productData) => {
    try {
      setActionLoading(true);
      const res = await productService.createProduct(productData);
      if (res.success) {
        setToast({ type: 'success', message: 'Product registered successfully!' });
        setIsAddModalOpen(false);
        fetchDashboardData();
      }
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Failed to add product.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStockIn = async (formData) => {
    try {
      setActionLoading(true);
      const res = await stockService.stockIn(formData);
      if (res.success) {
        setToast({ type: 'success', message: res.message });
        setIsStockInOpen(false);
        fetchDashboardData();
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

  const handleStockOut = async (formData) => {
    try {
      setActionLoading(true);
      const res = await stockService.stockOut(formData);
      if (res.success) {
        setToast({ type: 'success', message: res.message });
        setIsStockOutOpen(false);
        fetchDashboardData();
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

  if (loading) {
    return <LoadingSpinner text="Fetching hospital inventory telemetry..." size="lg" />;
  }

  const stats = data?.stats || {};
  const charts = data?.charts || {};
  const recentActivities = data?.recentActivities || [];
  const alerts = data?.alerts || {};

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

      {/* Page Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Hospital Stock Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time medical supply balances, telemetry, and critical replenishment alerts
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
            title="Refresh Telemetry"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? 'animate-spin text-sky-600' : ''}`}
            />
          </button>

          <button
            onClick={() => setIsStockInOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-sky-600 text-white hover:bg-sky-700 shadow-sm transition-all"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Stock In</span>
          </button>

          <button
            onClick={() => setIsStockOutOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-600 text-white hover:bg-amber-700 shadow-sm transition-all"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Stock Out</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Total Products"
          value={stats.totalProducts || 0}
          subtitle="Registered SKUs"
          icon={Package}
          colorScheme="navy"
        />
        <MetricCard
          title="Total Medicines"
          value={stats.totalMedicines || 0}
          subtitle="Formulations & IVs"
          icon={Pill}
          colorScheme="blue"
        />
        <MetricCard
          title="Medical Equipment"
          value={stats.totalMedicalEquipment || 0}
          subtitle="Instruments & Devices"
          icon={Stethoscope}
          colorScheme="indigo"
        />
        <MetricCard
          title="Available Stock"
          value={(stats.totalAvailableStock || 0).toLocaleString()}
          subtitle="Usable non-expired units"
          icon={CheckCircle2}
          colorScheme="emerald"
        />
        <MetricCard
          title="Low Stock Items"
          value={stats.lowStockCount || 0}
          subtitle="Below safe threshold"
          icon={AlertTriangle}
          colorScheme="amber"
        />
        <MetricCard
          title="Expired Products"
          value={stats.expiredCount || 0}
          subtitle="Quarantined items"
          icon={ShieldAlert}
          colorScheme="rose"
        />
      </div>

      {/* Critical Alert Banners */}
      <AlertBanner
        alerts={alerts}
        onOpenStockIn={() => setIsStockInOpen(true)}
      />

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StockLevelChart data={charts.weeklyTrends || []} />
        </div>
        <div className="lg:col-span-1">
          <CategoryPieChart data={charts.categoryDistribution || []} />
        </div>
      </div>

      {/* Recent Activities Feed & Valuation Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivities activities={recentActivities} />
        </div>

        {/* Inventory Valuation Card */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900">
                Inventory Valuation
              </h3>
              <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Aggregated capital value of all currently stored medicines and hospital assets
            </p>

            <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Total Portfolio Value
              </p>
              <h4 className="text-3xl font-extrabold text-slate-900 mt-1">
                ${(stats.totalStockValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h4>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Active Suppliers:</span>
                <span className="font-bold text-slate-800">{stats.totalSuppliers || 0} Vendors</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Expiring Within 60 Days:</span>
                <span className="font-bold text-amber-600">
                  {stats.nearingExpiryCount || 0} Products
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Loss from Expired Stock:</span>
                <span className="font-bold text-rose-600">
                  {stats.totalExpiredStock || 0} Units Quarantined
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => setIsStockInOpen(true)}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors"
            >
              Initiate Stock Replenishment &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProductFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddProduct}
        loading={actionLoading}
      />

      <StockInModal
        isOpen={isStockInOpen}
        onClose={() => setIsStockInOpen(false)}
        onSubmit={handleStockIn}
        products={products}
        loading={actionLoading}
      />

      <StockOutModal
        isOpen={isStockOutOpen}
        onClose={() => setIsStockOutOpen(false)}
        onSubmit={handleStockOut}
        products={products}
        loading={actionLoading}
      />
    </div>
  );
};

export default Dashboard;
