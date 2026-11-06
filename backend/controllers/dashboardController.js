const Product = require('../models/Product');
const StockTransaction = require('../models/StockTransaction');
const Supplier = require('../models/Supplier');

// @desc    Get comprehensive dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const sixtyDaysLater = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

    // Fetch all products
    const products = await Product.find();

    const totalProducts = products.length;
    let totalMedicines = 0;
    let totalMedicalEquipment = 0;
    let totalGeneralSupplies = 0;

    let totalAvailableStock = 0; // Usable (non-expired)
    let totalExpiredStock = 0;
    let totalStockValue = 0;

    const lowStockItems = [];
    const expiredProducts = [];
    const nearingExpiryProducts = [];

    products.forEach((p) => {
      const isExpired = p.expiryDate && new Date(p.expiryDate) < now;
      const isExpiringSoon =
        p.expiryDate &&
        new Date(p.expiryDate) >= now &&
        new Date(p.expiryDate) <= sixtyDaysLater;

      // Category counts
      if (p.category === 'Medicine') totalMedicines += 1;
      else if (p.category === 'Medical Equipment') totalMedicalEquipment += 1;
      else if (p.category === 'General Supplies') totalGeneralSupplies += 1;

      // Stock counts
      if (isExpired) {
        expiredProducts.push(p);
        totalExpiredStock += p.quantity;
      } else {
        totalAvailableStock += p.quantity;
      }

      totalStockValue += p.quantity * p.unitPrice;

      if (p.quantity <= p.minimumStockLevel) {
        lowStockItems.push(p);
      }

      if (isExpiringSoon) {
        nearingExpiryProducts.push(p);
      }
    });

    const totalSuppliers = await Supplier.countDocuments();

    // Category distribution for pie / bar chart
    const categoryDistribution = [
      {
        name: 'Medicines',
        category: 'Medicine',
        count: totalMedicines,
        totalQuantity: products
          .filter((p) => p.category === 'Medicine')
          .reduce((sum, p) => sum + p.quantity, 0),
        value: products
          .filter((p) => p.category === 'Medicine')
          .reduce((sum, p) => sum + p.quantity * p.unitPrice, 0),
        color: '#0284c7', // Sky blue
      },
      {
        name: 'Medical Equipment',
        category: 'Medical Equipment',
        count: totalMedicalEquipment,
        totalQuantity: products
          .filter((p) => p.category === 'Medical Equipment')
          .reduce((sum, p) => sum + p.quantity, 0),
        value: products
          .filter((p) => p.category === 'Medical Equipment')
          .reduce((sum, p) => sum + p.quantity * p.unitPrice, 0),
        color: '#1e3a8a', // Navy blue
      },
      {
        name: 'General Supplies',
        category: 'General Supplies',
        count: totalGeneralSupplies,
        totalQuantity: products
          .filter((p) => p.category === 'General Supplies')
          .reduce((sum, p) => sum + p.quantity, 0),
        value: products
          .filter((p) => p.category === 'General Supplies')
          .reduce((sum, p) => sum + p.quantity * p.unitPrice, 0),
        color: '#0d9488', // Teal
      },
    ];

    // Recent 10 stock activities
    const recentActivities = await StockTransaction.find()
      .sort({ createdAt: -1 })
      .limit(10);

    // Stock transaction trends (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const pastTransactions = await StockTransaction.find({
      createdAt: { $gte: sevenDaysAgo },
    });

    // Group transactions by day
    const daysMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      const dateStr = d.toISOString().split('T')[0];
      daysMap[dateStr] = {
        date: dayLabel,
        stockIn: 0,
        stockOut: 0,
      };
    }

    pastTransactions.forEach((tx) => {
      const txDateStr = new Date(tx.createdAt).toISOString().split('T')[0];
      if (daysMap[txDateStr]) {
        if (tx.type === 'STOCK_IN') {
          daysMap[txDateStr].stockIn += tx.quantity;
        } else if (tx.type === 'STOCK_OUT') {
          daysMap[txDateStr].stockOut += tx.quantity;
        }
      }
    });

    const weeklyTrends = Object.values(daysMap);

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        totalMedicines,
        totalMedicalEquipment,
        totalGeneralSupplies,
        totalAvailableStock,
        totalExpiredStock,
        totalStockValue: Math.round(totalStockValue * 100) / 100,
        lowStockCount: lowStockItems.length,
        expiredCount: expiredProducts.length,
        nearingExpiryCount: nearingExpiryProducts.length,
        totalSuppliers,
      },
      charts: {
        categoryDistribution,
        weeklyTrends,
      },
      recentActivities,
      alerts: {
        lowStock: lowStockItems.slice(0, 5),
        nearingExpiry: nearingExpiryProducts.slice(0, 5),
        expired: expiredProducts.slice(0, 5),
      },
    });
  } catch (error) {
    next(error);
  }
};
