import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import supplierService from '../../services/supplierService';
import { Package, Calendar, DollarSign, Layers, MapPin, Hash, Building } from 'lucide-react';

export const ProductFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  product = null,
  loading = false,
}) => {
  const isEdit = !!product;

  const initialForm = {
    productId: '',
    name: '',
    category: 'Medicine',
    description: '',
    quantity: 0,
    unitPrice: 0,
    unit: 'Units',
    supplier: '',
    supplierName: '',
    manufacturingDate: '',
    expiryDate: '',
    minimumStockLevel: 10,
    batchNumber: '',
    location: 'Main Hospital Store',
  };

  const [formData, setFormData] = useState(initialForm);
  const [suppliers, setSuppliers] = useState([]);
  const [error, setError] = useState('');

  // Fetch available suppliers for dropdown
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await supplierService.getSuppliers();
        if (res.success) {
          setSuppliers(res.data);
        }
      } catch (err) {
        console.error('Failed to load suppliers:', err);
      }
    };
    if (isOpen) {
      fetchSuppliers();
    }
  }, [isOpen]);

  // Load product if editing
  useEffect(() => {
    if (product) {
      setFormData({
        productId: product.productId || '',
        name: product.name || '',
        category: product.category || 'Medicine',
        description: product.description || '',
        quantity: product.quantity !== undefined ? product.quantity : 0,
        unitPrice: product.unitPrice !== undefined ? product.unitPrice : 0,
        unit: product.unit || 'Units',
        supplier: product.supplier?._id || product.supplier || '',
        supplierName: product.supplierName || '',
        manufacturingDate: product.manufacturingDate
          ? new Date(product.manufacturingDate).toISOString().split('T')[0]
          : '',
        expiryDate: product.expiryDate
          ? new Date(product.expiryDate).toISOString().split('T')[0]
          : '',
        minimumStockLevel:
          product.minimumStockLevel !== undefined ? product.minimumStockLevel : 10,
        batchNumber: product.batchNumber || '',
        location: product.location || 'Main Hospital Store',
      });
    } else {
      setFormData(initialForm);
    }
    setError('');
  }, [product, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'supplier') {
      const selected = suppliers.find((s) => s._id === value);
      setFormData({
        ...formData,
        supplier: value,
        supplierName: selected ? selected.name : '',
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.category || !formData.manufacturingDate || !formData.expiryDate) {
      setError('Please provide Name, Category, Manufacturing Date, and Expiry Date.');
      return;
    }

    if (!isEdit && !formData.productId) {
      setError('Please provide a unique Product ID (SKU).');
      return;
    }

    if (new Date(formData.expiryDate) <= new Date(formData.manufacturingDate)) {
      setError('Expiry Date must be after Manufacturing Date.');
      return;
    }

    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Product: ${product.name}` : 'Register New Hospital Product'}
      subtitle="Complete product details for inventory database tracking"
      maxWidth="max-w-3xl"
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Product ID & Name */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Product ID / SKU *
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                disabled={isEdit}
                placeholder="e.g. MED-1008"
                required
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none uppercase font-mono disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Product Name *
            </label>
            <div className="relative">
              <Package className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Amoxicillin 500mg Capsules"
                required
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Category, Unit, Unit Price */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Category *
            </label>
            <div className="relative">
              <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none bg-white"
              >
                <option value="Medicine">Medicine</option>
                <option value="Medical Equipment">Medical Equipment</option>
                <option value="General Supplies">General Supplies</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Unit of Measure
            </label>
            <input
              type="text"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              placeholder="e.g. Boxes, Vials, Tablets"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Unit Price ($) *
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                step="0.01"
                min="0"
                name="unitPrice"
                value={formData.unitPrice}
                onChange={handleChange}
                required
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none font-medium"
              />
            </div>
          </div>
        </div>

        {/* Row 3: Stock Quantity, Minimum Stock Level, Batch Number */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              {isEdit ? 'Current Quantity' : 'Initial Stock Quantity'}
            </label>
            <input
              type="number"
              min="0"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              disabled={isEdit}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none font-bold disabled:bg-slate-100"
            />
            {isEdit && (
              <p className="text-[10px] text-slate-400 mt-1">
                Use Stock In/Out to update balance.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Min Stock Level *
            </label>
            <input
              type="number"
              min="0"
              name="minimumStockLevel"
              value={formData.minimumStockLevel}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Batch / Lot Number
            </label>
            <input
              type="text"
              name="batchNumber"
              value={formData.batchNumber}
              onChange={handleChange}
              placeholder="e.g. BATCH-2026-X"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none font-mono text-xs"
            />
          </div>
        </div>

        {/* Row 4: Manufacturing Date & Expiry Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Manufacturing Date *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                name="manufacturingDate"
                value={formData.manufacturingDate}
                onChange={handleChange}
                required
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Expiry Date *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                required
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Row 5: Supplier & Storage Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Supplier / Distributor
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none bg-white"
              >
                <option value="">-- Direct Hospital Stock / Generic --</option>
                {suppliers.map((sup) => (
                  <option key={sup._id} value={sup._id}>
                    {sup.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Storage Location
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Shelf A-03 / Cold Room"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Row 6: Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Clinical / Usage Description
          </label>
          <textarea
            rows="2"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Clinical indications, dosage forms, or storage warnings..."
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none resize-none"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : null}
            {isEdit ? 'Save Changes' : 'Register Product'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductFormModal;
