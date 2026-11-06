const express = require('express');
const router = express.Router();
const {
  stockIn,
  stockOut,
  getStockHistory,
} = require('../controllers/stockController');
const { protect } = require('../middleware/authMiddleware');

router.post('/in', protect, stockIn);
router.post('/out', protect, stockOut);
router.get('/history', protect, getStockHistory);

module.exports = router;
