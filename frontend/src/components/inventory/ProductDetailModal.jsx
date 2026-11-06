import React from 'react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import {
  Package,
  Layers,
  Calendar,
  DollarSign,
  Building,
  MapPin,
  Hash,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  AlertTriangle,
} from 'lucide-react';

export const ProductDetailModal = ({
  isOpen,
  onClose,
  product,
  transactions = [],
  onStockIn,
  onStockOut,
  onEdit,
}) => {
  if (!product) return null;

  const isExpired = product.expiryDate && new Date(product.expiryDate) < new Date();
  const isLowStock = product.quantity <= product.minimumStockLevel;
  const statusText = isExpired ? 'Expired' : isLowStock ? 'Low Stock' : 'In Stock';

  const mfgFormatted = product.manufacturingDate
    ? new Date(product.manufacturingDate).toLocaleDateString()
    : 'N/A';
  const expFormatted = product.expiryDate
    ? new Date(product.expiryDate).toLocaleDateString()
    : 'N/A';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product.name}
      subtitle={`Product ID: ${product.productId}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Top Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Current Stock
            </p>
            <p className="text-xl font-extrabold text-slate-900 mt-1">
              {product.quantity}{' '}
              <span className="text-xs font-normal text-slate-500">{product.unit}</span>
            </p>
            <div className="mt-1">
              <StatusBadge status={statusText} />
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Unit Price
            </p>
            <p className="text-xl font-extrabold text-slate-900 mt-1">
              ${Number(product.unitPrice).toFixed(2)}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Total Val: ${(product.quantity * product.unitPrice).toLocaleString()}
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Min Threshold
            </p>
            <p className="text-xl font-extrabold text-slate-900 mt-1">
              {product.minimumStockLevel}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Reorder Point</p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Expiry Status
            </p>
            <p className="text-sm font-bold text-slate-900 mt-1 truncate">
              {expFormatted}
            </p>
            <p
              className={`text-[11px] font-semibold mt-1 ${
                isExpired ? 'text-rose-600' : 'text-slate-500'
              }`}
            >
              {isExpired ? 'Quarantined / Expired' : 'Safe for Dispensing'}
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2.5 p-4 rounded-xl bg-white border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              Specifications & Logistics
            </h4>
            <div className="flex justify-between">
              <span className="text-slate-500">Category:</span>
              <span className="font-semibold text-slate-800">{product.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Batch / Lot Number:</span>
              <span className="font-mono font-semibold text-slate-800">
                {product.batchNumber || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Storage Location:</span>
              <span className="font-semibold text-slate-800">{product.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Mfg Date:</span>
              <span className="font-semibold text-slate-800">{mfgFormatted}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Expiry Date:</span>
              <span className="font-semibold text-slate-800">{expFormatted}</span>
            </div>
          </div>

          <div className="space-y-2.5 p-4 rounded-xl bg-white border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              Supplier & Vendor Information
            </h4>
            <div className="flex justify-between">
              <span className="text-slate-500">Supplier Name:</span>
              <span className="font-semibold text-slate-800">
                {product.supplier?.name || product.supplierName || 'Direct / General'}
              </span>
            </div>
            {product.supplier && (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact Person:</span>
                  <span className="font-semibold text-slate-800">
                    {product.supplier.contactPerson || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact Phone:</span>
                  <span className="font-semibold text-slate-800">
                    {product.supplier.contactNumber || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-semibold text-slate-800">
                    {product.supplier.email || 'N/A'}
                  </span>
                </div>
              </>
            )}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-slate-500 mb-1">Description:</p>
              <p className="text-slate-700 italic">
                {product.description || 'No additional clinical remarks.'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => {
              onClose();
              onStockIn(product);
            }}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-sky-600 hover:bg-sky-700 text-white transition-colors flex items-center gap-1.5"
          >
            <ArrowDownLeft className="w-4 h-4" />
            Stock In (Receive)
          </button>
          <button
            onClick={() => {
              onClose();
              onStockOut(product);
            }}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-colors flex items-center gap-1.5"
          >
            <ArrowUpRight className="w-4 h-4" />
            Stock Out (Issue to Ward)
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit(product);
            }}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors ml-auto"
          >
            Edit Product
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ProductDetailModal;
