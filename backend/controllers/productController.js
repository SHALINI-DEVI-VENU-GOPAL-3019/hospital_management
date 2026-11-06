const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const StockTransaction = require('../models/StockTransaction');

// @desc    Get all products (with search, category filter, stock status filter, sort)
// @route   GET /api/products
// @access  Private
exports.getProducts = async (req, res, next) => {
  try {
    const { search, category, status, sortBy, sortOrder } = req.query;

    const query = {};

    // Search by name, productId, description, or batch number
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { productId: searchRegex },
        { description: searchRegex },
        { batchNumber: searchRegex },
        { supplierName: searchRegex },
      ];
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    const now = new Date();
    const sixtyDaysLater = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

    // Filter by stock/expiry status
    if (status === 'low-stock') {
      query.$expr = { $lte: ['$quantity', '$minimumStockLevel'] };
    } else if (status === 'out-of-stock') {
      query.quantity = { $lte: 0 };
    } else if (status === 'expired') {
      query.expiryDate = { $lt: now };
    } else if (status === 'expiring-soon') {
      query.expiryDate = { $gte: now, $lte: sixtyDaysLater };
    } else if (status === 'healthy') {
      query.expiryDate = { $gt: sixtyDaysLater };
      query.$expr = { $gt: ['$quantity', '$minimumStockLevel'] };
    }

    // Sorting
    let sortObj = { createdAt: -1 };
    if (sortBy) {
      const order = sortOrder === 'asc' ? 1 : -1;
      sortObj = { [sortBy]: order };
    }

    const products = await Product.find(query)
      .populate('supplier', 'name email contactNumber contactPerson')
      .sort(sortObj);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Private
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'supplier',
      'name email contactNumber address contactPerson'
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Also get last 10 transactions for this product
    const transactions = await StockTransaction.find({ product: product._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: product,
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private
exports.createProduct = async (req, res, next) => {
  try {
    let {
      productId,
      name,
      category,
      description,
      quantity,
      unitPrice,
      unit,
      supplier,
      manufacturingDate,
      expiryDate,
      minimumStockLevel,
      batchNumber,
      location,
    } = req.body;

    if (!productId || !name || !category || !manufacturingDate || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: Product ID, Name, Category, Manufacturing Date, and Expiry Date.',
      });
    }

    productId = productId.trim().toUpperCase();

    // Check if productId is already taken
    const existing = await Product.findOne({ productId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Product ID '${productId}' is already registered. Please use a unique Product ID.`,
      });
    }

    // Resolve supplier name if supplier ID provided
    let supplierName = 'Direct / Hospital Store';
    if (supplier) {
      const sup = await Supplier.findById(supplier);
      if (sup) {
        supplierName = sup.name;
      }
    } else if (req.body.supplierName) {
      supplierName = req.body.supplierName;
    }

    const product = await Product.create({
      productId,
      name: name.trim(),
      category,
      description: description || '',
      quantity: Number(quantity) || 0,
      unitPrice: Number(unitPrice) || 0,
      unit: unit || 'Units',
      supplier: supplier || null,
      supplierName,
      manufacturingDate: new Date(manufacturingDate),
      expiryDate: new Date(expiryDate),
      minimumStockLevel: Number(minimumStockLevel) !== undefined ? Number(minimumStockLevel) : 10,
      batchNumber: batchNumber ? batchNumber.trim() : '',
      location: location || 'Main Hospital Store',
    });

    // If initial quantity > 0, log an initial stock in transaction
    if (product.quantity > 0) {
      await StockTransaction.create({
        product: product._id,
        productId: product.productId,
        productName: product.name,
        category: product.category,
        type: 'STOCK_IN',
        quantity: product.quantity,
        previousStock: 0,
        newStock: product.quantity,
        unitPrice: product.unitPrice,
        totalValue: product.quantity * product.unitPrice,
        performedBy: req.user ? req.user._id : null,
        performedByName: req.user ? req.user.name : 'System Admin',
        recipientOrSource: supplierName,
        referenceNumber: 'INITIAL-STOCK',
        notes: 'Initial inventory registration stock',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully!',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const {
      name,
      category,
      description,
      unitPrice,
      unit,
      supplier,
      manufacturingDate,
      expiryDate,
      minimumStockLevel,
      batchNumber,
      location,
    } = req.body;

    if (supplier) {
      const sup = await Supplier.findById(supplier);
      if (sup) {
        product.supplierName = sup.name;
        product.supplier = supplier;
      }
    } else if (req.body.supplierName) {
      product.supplierName = req.body.supplierName;
    }

    if (name) product.name = name.trim();
    if (category) product.category = category;
    if (description !== undefined) product.description = description;
    if (unitPrice !== undefined) product.unitPrice = Number(unitPrice);
    if (unit) product.unit = unit;
    if (manufacturingDate) product.manufacturingDate = new Date(manufacturingDate);
    if (expiryDate) product.expiryDate = new Date(expiryDate);
    if (minimumStockLevel !== undefined) product.minimumStockLevel = Number(minimumStockLevel);
    if (batchNumber !== undefined) product.batchNumber = batchNumber;
    if (location !== undefined) product.location = location;

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully!',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Also delete or keep transactions associated with product
    await StockTransaction.deleteMany({ product: product._id });
    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product and associated stock history deleted successfully!',
    });
  } catch (error) {
    next(error);
  }
};
