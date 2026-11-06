const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide supplier name'],
      trim: true,
      maxlength: [120, 'Supplier name cannot exceed 120 characters'],
    },
    contactPerson: {
      type: String,
      trim: true,
      default: '',
    },
    contactNumber: {
      type: String,
      required: [true, 'Please provide supplier contact number'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide supplier email address'],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    address: {
      type: String,
      required: [true, 'Please provide supplier address'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for counting products supplied
supplierSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'supplier',
});

module.exports = mongoose.model('Supplier', supplierSchema);
