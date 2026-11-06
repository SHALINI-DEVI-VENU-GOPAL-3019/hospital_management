import React, { useState, useEffect } from 'react';
import supplierService from '../services/supplierService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import Toast from '../components/common/Toast';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SupplierModal from '../components/suppliers/SupplierModal';
import Modal from '../components/common/Modal';

import {
  Truck,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  User,
  Package,
  Edit2,
  Trash2,
  ExternalLink,
  Building,
} from 'lucide-react';

export const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [supplierProducts, setSupplierProducts] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await supplierService.getSuppliers({ search: searchTerm });
      if (res.success) {
        setSuppliers(res.data);
      }
    } catch (err) {
      console.error('Failed to load suppliers:', err);
      setToast({
        type: 'error',
        message: 'Failed to load supplier records from server.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSuppliers();
  };

  const handleSaveSupplier = async (formData) => {
    try {
      setActionLoading(true);
      if (selectedSupplier) {
        const res = await supplierService.updateSupplier(selectedSupplier._id, formData);
        if (res.success) {
          setToast({ type: 'success', message: 'Supplier profile updated!' });
          setIsFormOpen(false);
          setSelectedSupplier(null);
          fetchSuppliers();
        }
      } else {
        const res = await supplierService.createSupplier(formData);
        if (res.success) {
          setToast({ type: 'success', message: 'New supplier registered successfully!' });
          setIsFormOpen(false);
          fetchSuppliers();
        }
      }
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Failed to save supplier.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSupplier) return;
    try {
      setActionLoading(true);
      const res = await supplierService.deleteSupplier(selectedSupplier._id);
      if (res.success) {
        setToast({ type: 'success', message: 'Supplier removed.' });
        setIsDeleteOpen(false);
        setSelectedSupplier(null);
        fetchSuppliers();
      }
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete supplier.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewSupplierProducts = async (supplier) => {
    setSelectedSupplier(supplier);
    try {
      const res = await supplierService.getSupplierById(supplier._id);
      if (res.success) {
        setSupplierProducts(res.data.products || []);
        setIsDetailOpen(true);
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load supplied catalog.' });
    }
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
            Supplier & Vendor Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage pharmaceutical companies, biomedical distributors, and equipment contracts
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedSupplier(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-sky-600 text-white hover:bg-sky-700 shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Supplier</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search suppliers by company name, contact person, phone, or email..."
            className="w-full pl-10 pr-24 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Supplier Cards Grid */}
      {loading ? (
        <LoadingSpinner text="Retrieving verified supplier network..." />
      ) : suppliers.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-white border border-slate-200">
          <Truck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">No suppliers found</h3>
          <p className="text-xs text-slate-500 mt-1">
            No vendor matches your search criteria. Add your first supplier above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {suppliers.map((sup) => (
            <div
              key={sup._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 font-bold">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight group-hover:text-sky-600 transition-colors">
                        {sup.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {sup.contactPerson ? `Rep: ${sup.contactPerson}` : 'Healthcare Vendor'}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={sup.status} />
                </div>

                {/* Details */}
                <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{sup.contactNumber}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{sup.email}</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2 text-slate-500">{sup.address}</span>
                  </div>
                </div>

                {/* Notes */}
                {sup.notes && (
                  <p className="mt-3 p-2 rounded-lg bg-slate-50 text-[11px] text-slate-500 italic line-clamp-2">
                    "{sup.notes}"
                  </p>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleViewSupplierProducts(sup)}
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>{sup.productCount || 0} Products Supplied</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setSelectedSupplier(sup);
                      setIsFormOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                    title="Edit Supplier"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setSelectedSupplier(sup);
                      setIsDeleteOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                    title="Delete Supplier"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Supplier Form Modal */}
      <SupplierModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedSupplier(null);
        }}
        onSubmit={handleSaveSupplier}
        supplier={selectedSupplier}
        loading={actionLoading}
      />

      {/* View Associated Products Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedSupplier(null);
          setSupplierProducts([]);
        }}
        title={`Products Supplied by ${selectedSupplier?.name}`}
        subtitle={`Total of ${supplierProducts.length} items cataloged under this distributor`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          {supplierProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No products currently associated with this supplier.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {supplierProducts.map((p) => (
                <div
                  key={p._id}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900">{p.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {p.productId} • {p.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-slate-900">
                      {p.quantity} {p.unit}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      ${Number(p.unitPrice).toFixed(2)} / unit
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => setIsDetailOpen(false)}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedSupplier(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Remove Supplier"
        message={`Are you sure you want to remove "${selectedSupplier?.name}" from your active supplier directory? Products currently linked will be safely preserved with unlinked vendor tag.`}
        confirmText="Remove Supplier"
        type="danger"
        loading={actionLoading}
      />
    </div>
  );
};

export default Suppliers;
