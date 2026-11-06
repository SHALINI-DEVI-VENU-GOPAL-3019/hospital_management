const Product = require('../models/Product');
const StockTransaction = require('../models/StockTransaction');

// @desc    Get complete inventory report with valuations & statistics
// @route   GET /api/reports/inventory
// @access  Private
exports.getInventoryReport = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { productId: regex }, { supplierName: regex }];
    }

    const products = await Product.find(query).sort({ name: 1 });

    const totalItems = products.length;
    const totalQuantity = products.reduce((acc, p) => acc + p.quantity, 0);
    const totalValue = products.reduce((acc, p) => acc + p.quantity * p.unitPrice, 0);

    const now = new Date();
    const enrichedProducts = products.map((p) => {
      const isExpired = p.expiryDate && new Date(p.expiryDate) < now;
      const isLowStock = p.quantity <= p.minimumStockLevel;
      return {
        ...p.toObject(),
        totalValuation: Math.round(p.quantity * p.unitPrice * 100) / 100,
        status: isExpired ? 'Expired' : isLowStock ? 'Low Stock' : 'Adequate',
      };
    });

    res.status(200).json({
      success: true,
      summary: {
        totalItems,
        totalQuantity,
        totalValue: Math.round(totalValue * 100) / 100,
        generatedAt: new Date().toISOString(),
      },
      data: enrichedProducts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get low stock report
// @route   GET /api/reports/low-stock
// @access  Private
exports.getLowStockReport = async (req, res, next) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ['$quantity', '$minimumStockLevel'] },
    }).sort({ quantity: 1 });

    const totalDeficit = products.reduce(
      (sum, p) => sum + Math.max(0, p.minimumStockLevel - p.quantity),
      0
    );

    res.status(200).json({
      success: true,
      summary: {
        totalLowStockProducts: products.length,
        criticalItemsCount: products.filter((p) => p.quantity === 0).length,
        totalReorderUnitsNeeded: totalDeficit,
        generatedAt: new Date().toISOString(),
      },
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expired and nearing expiry report
// @route   GET /api/reports/expired
// @access  Private
exports.getExpiredReport = async (req, res, next) => {
  try {
    const { days = 60 } = req.query;
    const now = new Date();
    const thresholdDate = new Date(Date.now() + Number(days) * 24 * 60 * 60 * 1000);

    // Products expired or expiring within threshold
    const products = await Product.find({
      expiryDate: { $lte: thresholdDate },
    }).sort({ expiryDate: 1 });

    const expiredList = [];
    const expiringSoonList = [];
    let expiredValue = 0;
    let atRiskValue = 0;

    products.forEach((p) => {
      const exp = new Date(p.expiryDate);
      const val = p.quantity * p.unitPrice;
      if (exp < now) {
        expiredList.push(p);
        expiredValue += val;
      } else {
        expiringSoonList.push(p);
        atRiskValue += val;
      }
    });

    res.status(200).json({
      success: true,
      summary: {
        expiredCount: expiredList.length,
        expiredUnits: expiredList.reduce((acc, p) => acc + p.quantity, 0),
        expiredValueLoss: Math.round(expiredValue * 100) / 100,
        expiringSoonCount: expiringSoonList.length,
        expiringSoonUnits: expiringSoonList.reduce((acc, p) => acc + p.quantity, 0),
        atRiskValue: Math.round(atRiskValue * 100) / 100,
        generatedAt: new Date().toISOString(),
      },
      data: {
        expired: expiredList,
        expiringSoon: expiringSoonList,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get stock transactions report (Stock in or Stock out)
// @route   GET /api/reports/transactions
// @access  Private
exports.getTransactionReport = async (req, res, next) => {
  try {
    const { type, startDate, endDate } = req.query;
    const query = {};

    if (type && type !== 'ALL') {
      query.type = type;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const transactions = await StockTransaction.find(query)
      .sort({ createdAt: -1 })
      .populate('performedBy', 'name email role');

    const totalQuantity = transactions.reduce((sum, t) => sum + t.quantity, 0);
    const totalAmount = transactions.reduce((sum, t) => sum + (t.totalValue || 0), 0);

    res.status(200).json({
      success: true,
      summary: {
        totalTransactions: transactions.length,
        totalQuantity,
        totalAmount: Math.round(totalAmount * 100) / 100,
        generatedAt: new Date().toISOString(),
      },
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};
