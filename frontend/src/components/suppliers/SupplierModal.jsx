import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Building, User, Phone, Mail, MapPin, FileText } from 'lucide-react';

export const SupplierModal = ({
  isOpen,
  onClose,
  onSubmit,
  supplier = null,
  loading = false,
}) => {
  const isEdit = !!supplier;

  const initialForm = {
    name: '',
    contactPerson: '',
    contactNumber: '',
    email: '',
    address: '',
    status: 'Active',
    notes: '',
  };

  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState('');

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || '',
        contactPerson: supplier.contactPerson || '',
        contactNumber: supplier.contactNumber || '',
        email: supplier.email || '',
        address: supplier.address || '',
        status: supplier.status || 'Active',
        notes: supplier.notes || '',
      });
    } else {
      setFormData(initialForm);
    }
    setError('');
  }, [supplier, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.contactNumber || !formData.email || !formData.address) {
      setError('Please provide Supplier Name, Contact Number, Email, and Address.');
      return;
    }

    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Supplier: ${supplier.name}` : 'Add New Healthcare Supplier'}
      subtitle="Register vendor details for pharmaceutical and medical equipment procurement"
      maxWidth="max-w-xl"
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Supplier Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Supplier / Vendor Company Name *
          </label>
          <div className="relative">
            <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Apex Pharma Logistics Ltd"
              required
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none font-semibold"
            />
          </div>
        </div>

        {/* Contact Person & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Contact Representative
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                placeholder="e.g. David Vance"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Vendor Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none bg-white font-medium"
            >
              <option value="Active">Active Partner</option>
              <option value="Inactive">Inactive / Suspended</option>
            </select>
          </div>
        </div>

        {/* Phone & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Contact Phone *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="e.g. +1 (800) 456-7890"
                required
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. orders@apexpharma.com"
                required
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Physical / Dispatch Address *
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <textarea
              rows="2"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. 450 Healthcare Blvd, Suite 300, Boston, MA"
              required
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none resize-none"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Notes / Specialty
          </label>
          <div className="relative">
            <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <textarea
              rows="2"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g. Primary antibiotics distributor, 48-hr cold chain delivery guarantee."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none resize-none"
            />
          </div>
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
            {isEdit ? 'Save Changes' : 'Register Supplier'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SupplierModal;
