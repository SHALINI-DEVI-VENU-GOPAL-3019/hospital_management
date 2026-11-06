import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { ArrowUpRight, Package, Hash, Building2, AlertTriangle } from 'lucide-react';

const DEPARTMENTS = [
  'Emergency Room (ER)',
  'Intensive Care Unit (ICU)',
  'Operating Theaters (OT)',
  'Outpatient Department (OPD)',
  'Pediatrics Ward',
  'Maternity & Obstetrics',
  'Orthopedic Ward',
  'General Medical Ward 1',
  'General Medical Ward 2',
  'Biomedical Engineering',
  'Central Laboratory',
];

export const StockOutModal = ({
  isOpen,
  onClose,
  onSubmit,
  products = [],
  selectedProduct = null,
  loading = false,
}) => {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Target product
  const activeProduct =
    products.find((p) => p._id === productId) || selectedProduct;

  useEffect(() => {
    if (selectedProduct) {
      setProductId(selectedProduct._id);
    } else if (products.length > 0 && !productId) {
      setProductId(products[0]._id);
    }
    setQuantity(1);
    setDepartment(DEPARTMENTS[0]);
    setReferenceNumber(`REQ-${Date.now().toString().slice(-6)}`);
    setNotes('');
    setError('');
  }, [selectedProduct, products, isOpen]);

  const currentQty = activeProduct?.quantity || 0;
  const numQty = Number(quantity) || 0;
  const isOverLimit = numQty > currentQty;
  const remainingQty = Math.max(0, currentQty - numQty);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!productId) {
      setError('Please select a product.');
      return;
    }

    if (numQty <= 0) {
      setError('Quantity to issue must be at least 1.');
      return;
    }

    if (numQty > currentQty) {
      setError(
        `Insufficient stock! Requested ${numQty} ${activeProduct?.unit || 'units'}, but only ${currentQty} are currently available in inventory.`
      );
      return;
    }

    onSubmit({
      productId,
      quantity: numQty,
      department: department.trim(),
      referenceNumber: referenceNumber.trim(),
      notes: notes.trim(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Issue Stock (Stock Out)"
      subtitle="Dispatch supplies to hospital wards, doctors, or operational units"
      maxWidth="max-w-xl"
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Product to Issue *
          </label>
          <div className="relative">
            <Package className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              disabled={!!selectedProduct}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none bg-white font-medium"
            >
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  [{p.productId}] {p.name} (Available: {p.quantity} {p.unit})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Stock Calculation Preview */}
        {activeProduct && (
          <div
            className={`grid grid-cols-3 gap-2 p-3 rounded-xl border text-center transition-colors ${
              isOverLimit
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-amber-50/70 border-amber-200 text-amber-900'
            }`}
          >
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">Available</p>
              <p className="text-sm font-bold text-slate-800">
                {currentQty} {activeProduct.unit}
              </p>
            </div>
            <div>
              <p
                className={`text-[10px] uppercase font-bold ${
                  isOverLimit ? 'text-rose-600' : 'text-amber-700'
                }`}
              >
                Issuing
              </p>
              <p
                className={`text-sm font-extrabold ${
                  isOverLimit ? 'text-rose-600' : 'text-amber-700'
                }`}
              >
                -{numQty}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">
                Remaining
              </p>
              <p
                className={`text-sm font-extrabold ${
                  isOverLimit ? 'text-rose-600' : 'text-slate-900'
                }`}
              >
                {remainingQty} {activeProduct.unit}
              </p>
            </div>
          </div>
        )}

        {/* Overlimit Warning Message */}
        {isOverLimit && (
          <div className="p-2.5 rounded-lg bg-rose-100 border border-rose-300 text-xs text-rose-800 font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>
              Stock-out quantity cannot exceed available quantity ({currentQty} {activeProduct?.unit})
            </span>
          </div>
        )}

        {/* Quantity to Issue & Department */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Quantity to Issue *
            </label>
            <input
              type="number"
              min="1"
              max={currentQty > 0 ? currentQty : 1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              className={`w-full px-3 py-2 text-sm rounded-xl border focus:ring-2 outline-none font-bold ${
                isOverLimit
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100 text-rose-700'
                  : 'border-slate-200 focus:border-sky-500 focus:ring-sky-100'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Destination Department / Ward *
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none bg-white font-medium"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Requisition Reference */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Requisition / Request Slip #
          </label>
          <div className="relative">
            <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g. REQ-ER-449"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none font-mono text-xs"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Dispensing Notes
          </label>
          <textarea
            rows="2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Attending physician, urgency note, patient batch allocation, etc."
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
            disabled={loading || isOverLimit || currentQty <= 0}
            className="px-5 py-2 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ArrowUpRight className="w-4 h-4" />
            )}
            Confirm Stock Out
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default StockOutModal;
