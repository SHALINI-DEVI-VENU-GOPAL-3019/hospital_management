const express = require('express');
const router = express.Router();
const {
  getInventoryReport,
  getLowStockReport,
  getExpiredReport,
  getTransactionReport,
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/inventory', protect, getInventoryReport);
router.get('/low-stock', protect, getLowStockReport);
router.get('/expired', protect, getExpiredReport);
router.get('/transactions', protect, getTransactionReport);

module.exports = router;
