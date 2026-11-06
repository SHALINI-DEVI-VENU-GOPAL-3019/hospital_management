import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { ArrowDownLeft, Package, Hash, Building, FileText } from 'lucide-react';

export const StockInModal = ({
  isOpen,
  onClose,
  onSubmit,
  products = [],
  selectedProduct = null,
  loading = false,
}) => {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [source, setSource] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [error, setError] = useState('');

  // Target product
  const activeProduct =
    products.find((p) => p._id === productId) || selectedProduct;

  useEffect(() => {
    if (selectedProduct) {
      setProductId(selectedProduct._id);
      setSource(selectedProduct.supplierName || '');
      setBatchNumber(selectedProduct.batchNumber || '');
    } else if (products.length > 0 && !productId) {
      setProductId(products[0]._id);
      setSource(products[0].supplierName || '');
      setBatchNumber(products[0].batchNumber || '');
    }
    setQuantity(1);
    setReferenceNumber(`IN-${Date.now().toString().slice(-6)}`);
    setNotes('');
    setError('');
  }, [selectedProduct, products, isOpen]);

  const handleProductChange = (e) => {
    const pId = e.target.value;
    setProductId(pId);
    const chosen = products.find((p) => p._id === pId);
    if (chosen) {
      setSource(chosen.supplierName || '');
      setBatchNumber(chosen.batchNumber || '');
    }
  };

  const currentQty = activeProduct?.quantity || 0;
  const newQty = currentQty + (Number(quantity) || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!productId) {
      setError('Please select a product.');
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      setError('Please enter a quantity greater than 0.');
      return;
    }

    onSubmit({
      productId,
      quantity: Number(quantity),
      source: source.trim(),
      referenceNumber: referenceNumber.trim(),
      batchNumber: batchNumber.trim(),
      notes: notes.trim(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Receive Stock (Stock In)"
      subtitle="Record new medical supply delivery and increase available balance"
      maxWidth="max-w-xl"
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Product to Stock In *
          </label>
          <div className="relative">
            <Package className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={productId}
              onChange={handleProductChange}
              disabled={!!selectedProduct}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none bg-white font-medium"
            >
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  [{p.productId}] {p.name} (Current: {p.quantity} {p.unit})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Stock Calculation Preview */}
        {activeProduct && (
          <div className="grid grid-cols-3 gap-2 p-3 bg-sky-50/70 border border-sky-100 rounded-xl text-center">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">Current</p>
              <p className="text-sm font-bold text-slate-800">
                {currentQty} {activeProduct.unit}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-sky-600">Adding</p>
              <p className="text-sm font-extrabold text-sky-600">
                +{Number(quantity) || 0}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-emerald-600">New Balance</p>
              <p className="text-sm font-extrabold text-emerald-700">
                {newQty} {activeProduct.unit}
              </p>
            </div>
          </div>
        )}

        {/* Quantity to Add & Batch Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Quantity Received *
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Batch / Lot Number
            </label>
            <input
              type="text"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              placeholder="e.g. BATCH-2026-N"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none font-mono text-xs"
            />
          </div>
        </div>

        {/* Source / Supplier & Invoice Reference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Source / Supplier Name
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. Apex Pharma Logistics"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Reference / Invoice #
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. PO-98412"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Receiving Notes
          </label>
          <textarea
            rows="2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Remarks regarding package conditions, cold chain integrity, etc."
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none resize-none"
          />
        </div>

        {/* Action Buttons */}
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
            ) : (
              <ArrowDownLeft className="w-4 h-4" />
            )}
            Confirm Stock In
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default StockInModal;
