const Product = require('../models/Product');
const StockTransaction = require('../models/StockTransaction');

// @desc    Stock In (Increase product quantity)
// @route   POST /api/stock/in
// @access  Private
exports.stockIn = async (req, res, next) => {
  try {
    const { productId, quantity, source, referenceNumber, notes, batchNumber, newExpiryDate } = req.body;

    if (!productId || !quantity || Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid product ID and quantity greater than 0.',
      });
    }

    const qty = Number(quantity);
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const previousStock = product.quantity;
    const newStock = previousStock + qty;

    product.quantity = newStock;
    if (batchNumber) product.batchNumber = batchNumber.trim();
    if (newExpiryDate) product.expiryDate = new Date(newExpiryDate);

    await product.save();

    const transaction = await StockTransaction.create({
      product: product._id,
      productId: product.productId,
      productName: product.name,
      category: product.category,
      type: 'STOCK_IN',
      quantity: qty,
      previousStock,
      newStock,
      unitPrice: product.unitPrice,
      totalValue: qty * product.unitPrice,
      performedBy: req.user ? req.user._id : null,
      performedByName: req.user ? req.user.name : 'Authorized Staff',
      recipientOrSource: source || product.supplierName || 'Medical Distributor',
      referenceNumber: referenceNumber || `IN-${Date.now().toString().slice(-6)}`,
      notes: notes || 'Received stock delivery into inventory',
    });

    res.status(200).json({
      success: true,
      message: `Successfully added ${qty} ${product.unit} to ${product.name}. New available stock: ${newStock}.`,
      data: {
        product,
        transaction,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Stock Out (Issue product / decrease quantity)
// @route   POST /api/stock/out
// @access  Private
exports.stockOut = async (req, res, next) => {
  try {
    const { productId, quantity, department, referenceNumber, notes } = req.body;

    if (!productId || !quantity || Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid product and quantity greater than 0.',
      });
    }

    const qty = Number(quantity);
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    // Check if expired
    const isExpired = product.expiryDate && new Date(product.expiryDate) < new Date();
    if (isExpired && product.category === 'Medicine') {
      // Optional: warning or allow disposal
    }

    // Check available stock
    if (qty > product.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock! Requested ${qty} ${product.unit}, but only ${product.quantity} ${product.unit} are currently available.`,
      });
    }

    const previousStock = product.quantity;
    const newStock = previousStock - qty;

    product.quantity = newStock;
    await product.save();

    const transaction = await StockTransaction.create({
      product: product._id,
      productId: product.productId,
      productName: product.name,
      category: product.category,
      type: 'STOCK_OUT',
      quantity: qty,
      previousStock,
      newStock,
      unitPrice: product.unitPrice,
      totalValue: qty * product.unitPrice,
      performedBy: req.user ? req.user._id : null,
      performedByName: req.user ? req.user.name : 'Authorized Staff',
      recipientOrSource: department || 'Emergency Ward',
      referenceNumber: referenceNumber || `OUT-${Date.now().toString().slice(-6)}`,
      notes: notes || 'Dispatched for hospital operations',
    });

    res.status(200).json({
      success: true,
      message: `Successfully issued ${qty} ${product.unit} of ${product.name} to ${department || 'Ward'}. Remaining stock: ${newStock}.`,
      data: {
        product,
        transaction,
        isNowLowStock: newStock <= product.minimumStockLevel,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Stock Transaction History
// @route   GET /api/stock/history
// @access  Private
exports.getStockHistory = async (req, res, next) => {
  try {
    const { type, category, limit = 50, search } = req.query;

    const query = {};

    if (type && type !== 'ALL') {
      query.type = type;
    }

    if (category && category !== 'ALL') {
      query.category = category;
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { productName: regex },
        { productId: regex },
        { recipientOrSource: regex },
        { referenceNumber: regex },
        { performedByName: regex },
      ];
    }

    const transactions = await StockTransaction.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('performedBy', 'name email role');

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};
