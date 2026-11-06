const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: [true, 'Please provide product ID / SKU'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
      maxlength: [150, 'Product name cannot exceed 150 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: {
        values: ['Medicine', 'Medical Equipment', 'General Supplies'],
        message: 'Category must be Medicine, Medical Equipment, or General Supplies',
      },
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide product quantity'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    unitPrice: {
      type: Number,
      required: [true, 'Please provide unit price'],
      min: [0, 'Unit price cannot be negative'],
      default: 0,
    },
    unit: {
      type: String,
      default: 'Units',
      trim: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      default: null,
    },
    supplierName: {
      type: String,
      trim: true,
      default: 'Direct / Hospital Store',
    },
    manufacturingDate: {
      type: Date,
      required: [true, 'Please provide manufacturing date'],
    },
    expiryDate: {
      type: Date,
      required: [true, 'Please provide expiry date'],
    },
    minimumStockLevel: {
      type: Number,
      required: [true, 'Please provide minimum stock level threshold'],
      min: [0, 'Minimum stock level cannot be negative'],
      default: 10,
    },
    batchNumber: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: 'Main Storage',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for low stock status
productSchema.virtual('isLowStock').get(function () {
  return this.quantity <= this.minimumStockLevel;
});

// Virtual for expired status
productSchema.virtual('isExpired').get(function () {
  return this.expiryDate ? new Date(this.expiryDate) < new Date() : false;
});

// Virtual for expiring soon (within 60 days)
productSchema.virtual('isExpiringSoon').get(function () {
  if (!this.expiryDate) return false;
  const now = new Date();
  const exp = new Date(this.expiryDate);
  const diffTime = exp - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 && diffDays <= 60;
});

// Virtual for days until expiry
productSchema.virtual('daysUntilExpiry').get(function () {
  if (!this.expiryDate) return null;
  const now = new Date();
  const exp = new Date(this.expiryDate);
  const diffTime = exp - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('Product', productSchema);
