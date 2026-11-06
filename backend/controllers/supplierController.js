const Supplier = require('../models/Supplier');
const Product = require('../models/Product');

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
exports.getSuppliers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = {};

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: regex },
        { contactPerson: regex },
        { email: regex },
        { contactNumber: regex },
        { address: regex },
      ];
    }

    const suppliers = await Supplier.find(query).sort({ name: 1 });

    // Aggregate count of products for each supplier
    const suppliersWithCount = await Promise.all(
      suppliers.map(async (sup) => {
        const productCount = await Product.countDocuments({
          $or: [{ supplier: sup._id }, { supplierName: sup.name }],
        });
        return {
          ...sup.toObject(),
          productCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: suppliersWithCount.length,
      data: suppliersWithCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single supplier with associated products
// @route   GET /api/suppliers/:id
// @access  Private
exports.getSupplierById = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found.',
      });
    }

    const products = await Product.find({
      $or: [{ supplier: supplier._id }, { supplierName: supplier.name }],
    });

    res.status(200).json({
      success: true,
      data: {
        ...supplier.toObject(),
        products,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new supplier
// @route   POST /api/suppliers
// @access  Private
exports.createSupplier = async (req, res, next) => {
  try {
    const { name, contactPerson, contactNumber, email, address, notes, status } = req.body;

    if (!name || !contactNumber || !email || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide supplier name, contact number, email, and address.',
      });
    }

    const supplier = await Supplier.create({
      name: name.trim(),
      contactPerson: contactPerson ? contactPerson.trim() : '',
      contactNumber: contactNumber.trim(),
      email: email.trim().toLowerCase(),
      address: address.trim(),
      notes: notes || '',
      status: status || 'Active',
    });

    res.status(201).json({
      success: true,
      message: 'Supplier added successfully!',
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private
exports.updateSupplier = async (req, res, next) => {
  try {
    let supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found.',
      });
    }

    const { name, contactPerson, contactNumber, email, address, notes, status } = req.body;

    const oldName = supplier.name;

    if (name) supplier.name = name.trim();
    if (contactPerson !== undefined) supplier.contactPerson = contactPerson.trim();
    if (contactNumber) supplier.contactNumber = contactNumber.trim();
    if (email) supplier.email = email.trim().toLowerCase();
    if (address) supplier.address = address.trim();
    if (notes !== undefined) supplier.notes = notes;
    if (status) supplier.status = status;

    await supplier.save();

    // If name changed, optionally update product.supplierName references
    if (name && name.trim() !== oldName) {
      await Product.updateMany(
        { supplier: supplier._id },
        { supplierName: supplier.name }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Supplier updated successfully!',
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private
exports.deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found.',
      });
    }

    // Check if products exist for this supplier
    const hasProducts = await Product.exists({
      $or: [{ supplier: supplier._id }, { supplierName: supplier.name }],
    });

    if (hasProducts) {
      // Unlink supplier from products instead of blocking or deleting products
      await Product.updateMany(
        { supplier: supplier._id },
        { supplier: null, supplierName: 'Former Supplier (Unlinked)' }
      );
    }

    await supplier.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Supplier removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};
