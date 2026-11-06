import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import productService from '../services/productService';
import stockService from '../services/stockService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import Toast from '../components/common/Toast';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ProductFormModal from '../components/inventory/ProductFormModal';
import ProductDetailModal from '../components/inventory/ProductDetailModal';
import StockInModal from '../components/stock/StockInModal';
import StockOutModal from '../components/stock/StockOutModal';

import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Edit2,
  Trash2,
  Eye,
  ArrowDownLeft,
  ArrowUpRight,
  Package,
  Calendar,
  AlertTriangle,
  Download,
} from 'lucide-react';

export const Inventory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals & Active Selections
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isStockInOpen, setIsStockInOpen] = useState(false);
  const [isStockOutOpen, setIsStockOutOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        category: categoryFilter,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sortBy,
        sortOrder,
      };

      const res = await productService.getProducts(params);
      if (res.success) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      setToast({
        type: 'error',
        message: 'Failed to load inventory items from server.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, statusFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  // CRUD Handlers
  const handleSaveProduct = async (formData) => {
    try {
      setActionLoading(true);
      if (selectedProduct) {
        const res = await productService.updateProduct(selectedProduct._id, formData);
        if (res.success) {
          setToast({ type: 'success', message: 'Product updated successfully!' });
          setIsFormOpen(false);
          setSelectedProduct(null);
          fetchProducts();
        }
      } else {
        const res = await productService.createProduct(formData);
        if (res.success) {
          setToast({ type: 'success', message: 'New product registered successfully!' });
          setIsFormOpen(false);
          fetchProducts();
        }
      }
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Failed to save product.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;
    try {
      setActionLoading(true);
      const res = await productService.deleteProduct(selectedProduct._id);
      if (res.success) {
        setToast({ type: 'success', message: 'Product deleted from inventory.' });
        setIsDeleteOpen(false);
        setSelectedProduct(null);
        fetchProducts();
      }
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete product.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStockInSubmit = async (formData) => {
    try {
      setActionLoading(true);
      const res = await stockService.stockIn(formData);
      if (res.success) {
        setToast({ type: 'success', message: res.message });
        setIsStockInOpen(false);
        fetchProducts();
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
        fetchProducts();
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

  // Export to CSV helper
  const exportToCSV = () => {
    if (products.length === 0) return;
    const headers = [
      'Product ID',
      'Name',
      'Category',
      'Quantity',
      'Unit',
      'Unit Price',
      'Total Value',
      'Min Level',
      'Supplier',
      'Mfg Date',
      'Expiry Date',
      'Batch',
      'Location',
    ];

    const rows = products.map((p) => [
      p.productId,
      `"${p.name.replace(/"/g, '""')}"`,
      p.category,
      p.quantity,
      p.unit,
      p.unitPrice,
      (p.quantity * p.unitPrice).toFixed(2),
      p.minimumStockLevel,
      `"${(p.supplier?.name || p.supplierName || '').replace(/"/g, '""')}"`,
      p.manufacturingDate ? new Date(p.manufacturingDate).toISOString().split('T')[0] : '',
      p.expiryDate ? new Date(p.expiryDate).toISOString().split('T')[0] : '',
      p.batchNumber || '',
      `"${(p.location || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hospital_inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

      {/* Page Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Hospital Inventory Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete database of pharmaceuticals, surgical devices, and clinical supplies
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setSelectedProduct(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-sky-600 text-white hover:bg-sky-700 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search box */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Product Name, ID, Batch, or Supplier..."
              className="w-full pl-10 pr-20 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Search
            </button>
          </form>

          {/* Quick Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {['All', 'Medicine', 'Medical Equipment', 'General Supplies'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
                  categoryFilter === cat
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filter & Sort controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-500">Status:</span>
            {[
              { label: 'All Items', value: 'all' },
              { label: 'Low Stock', value: 'low-stock' },
              { label: 'Expired', value: 'expired' },
              { label: 'Expiring Soon', value: 'expiring-soon' },
              { label: 'In Stock', value: 'healthy' },
            ].map((st) => (
              <button
                key={st.value}
                onClick={() => setStatusFilter(st.value)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  statusFilter === st.value
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 outline-none"
            >
              <option value="createdAt">Date Created</option>
              <option value="name">Product Name</option>
              <option value="quantity">Stock Quantity</option>
              <option value="unitPrice">Unit Price</option>
              <option value="expiryDate">Expiry Date</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
              title="Toggle Sort Order"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Data Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading inventory records..." />
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              No products found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No inventory records matched your search filters. Try adjusting your query or add a new product.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('All');
                setStatusFilter('all');
              }}
              className="mt-4 px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Product ID</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Stock Level</th>
                  <th className="py-3 px-4">Unit Price</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((item) => {
                  const now = new Date();
                  const expDate = item.expiryDate ? new Date(item.expiryDate) : null;
                  const isExpired = expDate ? expDate < now : false;
                  const isLowStock = item.quantity <= item.minimumStockLevel;

                  const statusBadgeText = isExpired
                    ? 'Expired'
                    : isLowStock
                    ? 'Low Stock'
                    : 'In Stock';

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Product ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-sky-700 whitespace-nowrap">
                        {item.productId}
                      </td>

                      {/* Product Name */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <button
                          onClick={() => {
                            setSelectedProduct(item);
                            setIsDetailOpen(true);
                          }}
                          className="font-bold text-slate-900 hover:text-sky-600 text-left block truncate"
                        >
                          {item.name}
                        </button>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {item.supplier?.name || item.supplierName || 'General Supply'}
                          {item.location ? ` • ${item.location}` : ''}
                        </p>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-medium text-slate-700">
                          {item.category}
                        </span>
                      </td>

                      {/* Stock Level */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-extrabold text-sm ${
                              item.quantity <= 0
                                ? 'text-rose-600'
                                : isLowStock
                                ? 'text-orange-600'
                                : 'text-slate-900'
                            }`}
                          >
                            {item.quantity}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {item.unit}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Min: {item.minimumStockLevel}
                        </span>
                      </td>

                      {/* Unit Price */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                        ${Number(item.unitPrice).toFixed(2)}
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`font-medium ${
                            isExpired ? 'text-rose-600 font-bold' : 'text-slate-700'
                          }`}
                        >
                          {expDate ? expDate.toLocaleDateString() : 'N/A'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={statusBadgeText} />
                      </td>

                      {/* Row Action Buttons */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedProduct(item);
                              setIsStockInOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50 transition-colors"
                            title="Stock In (+)"
                          >
                            <ArrowDownLeft className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedProduct(item);
                              setIsStockOutOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Stock Out (-)"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedProduct(item);
                              setIsDetailOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedProduct(item);
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedProduct(item);
                              setIsDeleteOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                            title="Delete"
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

        {/* Footer info */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {products.length} products</span>
          <span className="font-medium">Hospital Live Inventory Telemetry</span>
        </div>
      </div>

      {/* Modals */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleSaveProduct}
        product={selectedProduct}
        loading={actionLoading}
      />

      <ProductDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onStockIn={(p) => {
          setSelectedProduct(p);
          setIsStockInOpen(true);
        }}
        onStockOut={(p) => {
          setSelectedProduct(p);
          setIsStockOutOpen(true);
        }}
        onEdit={(p) => {
          setSelectedProduct(p);
          setIsFormOpen(true);
        }}
      />

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

      <StockOutModal
        isOpen={isStockOutOpen}
        onClose={() => {
          setIsStockOutOpen(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleStockOutSubmit}
        products={products}
        selectedProduct={selectedProduct}
        loading={actionLoading}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete "${selectedProduct?.name}" (${selectedProduct?.productId})? This will permanently remove the item and all associated stock transaction records.`}
        confirmText="Delete Product"
        type="danger"
        loading={actionLoading}
      />
    </div>
  );
};

export default Inventory;
