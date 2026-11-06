const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const StockTransaction = require('../models/StockTransaction');
const connectDB = require('../config/db');

const seedDatabase = async () => {
  try {
    const conn = await connectDB();
    if (!conn) {
      console.error('❌ Database connection failed. Aborting seed.');
      process.exit(1);
    }

    console.log('🧹 Clearing existing collections...');
    await User.deleteMany();
    await Supplier.deleteMany();
    await Product.deleteMany();
    await StockTransaction.deleteMany();

    console.log('👤 Seeding default users...');
    const adminUser = await User.create({
      name: 'Dr. Sarah Mitchell',
      email: 'admin@hospital.com',
      password: 'admin123',
      role: 'Hospital Admin',
      department: 'Hospital Administration & Pharmacy Board',
      phone: '+1 (555) 234-5678',
    });

    const staffUser = await User.create({
      name: 'James Rodriguez, RPh',
      email: 'staff@hospital.com',
      password: 'staff123',
      role: 'Inventory Staff',
      department: 'Central Pharmacy & Stores',
      phone: '+1 (555) 876-5432',
    });

    console.log('🏢 Seeding healthcare suppliers...');
    const suppliers = await Supplier.insertMany([
      {
        name: 'Apex Pharma Logistics Ltd',
        contactPerson: 'David Vance',
        contactNumber: '+1 (800) 456-7890',
        email: 'orders@apexpharma.com',
        address: '450 Healthcare Blvd, Suite 300, Boston, MA',
        notes: 'Primary supplier for antibiotics, IV fluids, and cardiovascular meds.',
        status: 'Active',
      },
      {
        name: 'MedTech Global Instruments',
        contactPerson: 'Elena Rostova',
        contactNumber: '+1 (888) 321-9870',
        email: 'sales@medtechglobal.com',
        address: '120 Innovation Way, San Jose, CA',
        notes: 'Surgical instruments, diagnostic monitors, and ICU equipment.',
        status: 'Active',
      },
      {
        name: 'BioCare Medical Supplies Co.',
        contactPerson: 'Marcus Chen',
        contactNumber: '+1 (800) 654-3210',
        email: 'support@biocaresupplies.com',
        address: '88 River Road, Chicago, IL',
        notes: 'Sterile consumables, syringes, gloves, and PPE.',
        status: 'Active',
      },
      {
        name: 'NovaLife Diagnostics Inc.',
        contactPerson: 'Rachel Adams',
        contactNumber: '+1 (866) 789-0123',
        email: 'contact@novalifedx.com',
        address: '3200 Research Parkway, Durham, NC',
        notes: 'Laboratory reagents, rapid testing kits, and blood glucose meters.',
        status: 'Active',
      },
    ]);

    console.log('💊 Seeding hospital products...');
    const now = new Date();

    // Helper date generators
    const monthsAgo = (m) => new Date(now.getFullYear(), now.getMonth() - m, now.getDate());
    const monthsAhead = (m) => new Date(now.getFullYear(), now.getMonth() + m, now.getDate());
    const daysAgo = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
    const daysAhead = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

    const productsData = [
      // 1. Healthy Medicines
      {
        productId: 'MED-1001',
        name: 'Amoxicillin 500mg Capsules',
        category: 'Medicine',
        description: 'Broad-spectrum antibiotic used for bacterial infections of respiratory tract and skin.',
        quantity: 450,
        unitPrice: 12.5,
        unit: 'Boxes (50 caps)',
        supplier: suppliers[0]._id,
        supplierName: suppliers[0].name,
        manufacturingDate: monthsAgo(4),
        expiryDate: monthsAhead(18),
        minimumStockLevel: 80,
        batchNumber: 'AMX-2024-99B',
        location: 'Bay 3 - Shelf A1',
      },
      {
        productId: 'MED-1002',
        name: 'Paracetamol IV Infusion 10mg/ml (100ml)',
        category: 'Medicine',
        description: 'Analgesic and antipyretic intravenous infusion for rapid relief of pain and fever.',
        quantity: 320,
        unitPrice: 4.8,
        unit: 'Vials',
        supplier: suppliers[0]._id,
        supplierName: suppliers[0].name,
        manufacturingDate: monthsAgo(3),
        expiryDate: monthsAhead(14),
        minimumStockLevel: 60,
        batchNumber: 'PCM-IV-882',
        location: 'Cold Storage Room 1',
      },
      {
        productId: 'MED-1003',
        name: 'Insulin Glargine 100 IU/ml (3ml Pen)',
        category: 'Medicine',
        description: 'Long-acting basal human insulin analog for diabetes mellitus management.',
        quantity: 110,
        unitPrice: 38.0,
        unit: 'Pens',
        supplier: suppliers[0]._id,
        supplierName: suppliers[0].name,
        manufacturingDate: monthsAgo(2),
        expiryDate: monthsAhead(10),
        minimumStockLevel: 30,
        batchNumber: 'INS-GL-401',
        location: 'Pharmacy Refrigerator #2',
      },
      {
        productId: 'MED-1004',
        name: 'Normal Saline 0.9% (500ml IV Bag)',
        category: 'Medicine',
        description: 'Isotonic crystalloid solution for electrolyte and fluid replenishment.',
        quantity: 850,
        unitPrice: 2.1,
        unit: 'Bags',
        supplier: suppliers[2]._id,
        supplierName: suppliers[2].name,
        manufacturingDate: monthsAgo(5),
        expiryDate: monthsAhead(20),
        minimumStockLevel: 150,
        batchNumber: 'NS-500-247',
        location: 'Fluid Storage Warehouse A',
      },
      // 2. Low Stock Medicine
      {
        productId: 'MED-1005',
        name: 'Epinephrine Injection 1mg/ml (1:1000)',
        category: 'Medicine',
        description: 'Emergency anaphylaxis and cardiac resuscitation ampoules.',
        quantity: 8, // Low Stock! (min is 25)
        unitPrice: 18.5,
        unit: 'Ampoules',
        supplier: suppliers[0]._id,
        supplierName: suppliers[0].name,
        manufacturingDate: monthsAgo(6),
        expiryDate: monthsAhead(8),
        minimumStockLevel: 25,
        batchNumber: 'EPI-EMG-102',
        location: 'Crash Cart Storage Bin 4',
      },
      // 3. Expiring Soon Medicine (expiring in 25 days)
      {
        productId: 'MED-1006',
        name: 'Ceftriaxone 1g Injection Vial',
        category: 'Medicine',
        description: 'Third-generation cephalosporin antibiotic for severe bacterial sepsis.',
        quantity: 45,
        unitPrice: 9.2,
        unit: 'Vials',
        supplier: suppliers[0]._id,
        supplierName: suppliers[0].name,
        manufacturingDate: monthsAgo(11),
        expiryDate: daysAhead(25), // Expiring in 25 days!
        minimumStockLevel: 20,
        batchNumber: 'CTX-1G-604',
        location: 'Bay 2 - Shelf C3',
      },
      // 4. Expired Medicine
      {
        productId: 'MED-1007',
        name: 'Morphine Sulfate 10mg/ml Injection',
        category: 'Medicine',
        description: 'Narcotic opioid analgesic for acute severe traumatic or surgical pain.',
        quantity: 14,
        unitPrice: 22.0,
        unit: 'Ampoules',
        supplier: suppliers[0]._id,
        supplierName: suppliers[0].name,
        manufacturingDate: monthsAgo(24),
        expiryDate: daysAgo(15), // Expired 15 days ago!
        minimumStockLevel: 15,
        batchNumber: 'MPH-OLD-019',
        location: 'Controlled Drug Safe - Quarantine',
      },
      // 5. Medical Equipment
      {
        productId: 'EQP-2001',
        name: 'Digital Blood Pressure Monitor Pro',
        category: 'Medical Equipment',
        description: 'Clinical grade automatic oscillometric upper arm sphygmomanometer.',
        quantity: 28,
        unitPrice: 85.0,
        unit: 'Units',
        supplier: suppliers[1]._id,
        supplierName: suppliers[1].name,
        manufacturingDate: monthsAgo(8),
        expiryDate: monthsAhead(48),
        minimumStockLevel: 10,
        batchNumber: 'BPM-PRO-301',
        location: 'Equipment Ward Depot',
      },
      {
        productId: 'EQP-2002',
        name: 'Fingertip Pulse Oximeter OLED',
        category: 'Medical Equipment',
        description: 'Continuous SpO2 and pulse rate monitoring sensor with dual display.',
        quantity: 6, // Low Stock! (min is 15)
        unitPrice: 32.0,
        unit: 'Units',
        supplier: suppliers[1]._id,
        supplierName: suppliers[1].name,
        manufacturingDate: monthsAgo(7),
        expiryDate: monthsAhead(36),
        minimumStockLevel: 15,
        batchNumber: 'OXI-994-F',
        location: 'Diagnostic Rack 2',
      },
      {
        productId: 'EQP-2003',
        name: 'Infusion Volumetric Pump System',
        category: 'Medical Equipment',
        description: 'Smart electronic micro-infusion delivery pump with air-in-line detector.',
        quantity: 12,
        unitPrice: 750.0,
        unit: 'Units',
        supplier: suppliers[1]._id,
        supplierName: suppliers[1].name,
        manufacturingDate: monthsAgo(10),
        expiryDate: monthsAhead(60),
        minimumStockLevel: 5,
        batchNumber: 'IFP-SYS-88',
        location: 'ICU Biomedical Workshop',
      },
      {
        productId: 'EQP-2004',
        name: 'Sterile Surgical Scalpel Blades #10',
        category: 'Medical Equipment',
        description: 'High grade surgical carbon steel blades for operating theater incisions.',
        quantity: 600,
        unitPrice: 0.85,
        unit: 'Blades',
        supplier: suppliers[1]._id,
        supplierName: suppliers[1].name,
        manufacturingDate: monthsAgo(6),
        expiryDate: monthsAhead(30),
        minimumStockLevel: 100,
        batchNumber: 'SC-10-ST',
        location: 'OT Sterile Prep Room',
      },
      // 6. General Supplies
      {
        productId: 'GEN-3001',
        name: 'Nitrile Examination Gloves - Powder Free (Medium)',
        category: 'General Supplies',
        description: 'Medical grade tactile barrier gloves, latex-free, non-sterile.',
        quantity: 120,
        unitPrice: 14.5,
        unit: 'Boxes (100 pcs)',
        supplier: suppliers[2]._id,
        supplierName: suppliers[2].name,
        manufacturingDate: monthsAgo(5),
        expiryDate: monthsAhead(24),
        minimumStockLevel: 30,
        batchNumber: 'GLV-NIT-M-44',
        location: 'Consumables Bay B4',
      },
      {
        productId: 'GEN-3002',
        name: 'Disposable Syringe with Needle 5ml',
        category: 'General Supplies',
        description: 'Luer-lock sterile single use hypodermic syringe 22G x 1.5".',
        quantity: 950,
        unitPrice: 0.35,
        unit: 'Packs',
        supplier: suppliers[2]._id,
        supplierName: suppliers[2].name,
        manufacturingDate: monthsAgo(6),
        expiryDate: monthsAhead(28),
        minimumStockLevel: 200,
        batchNumber: 'SYR-5ML-771',
        location: 'Consumables Bay A2',
      },
      {
        productId: 'GEN-3003',
        name: 'N95 Respirator Face Masks (Particulate)',
        category: 'General Supplies',
        description: 'NIOSH-certified protective surgical grade particulate respirators.',
        quantity: 18, // Low Stock! (min is 50)
        unitPrice: 28.0,
        unit: 'Boxes (20 pcs)',
        supplier: suppliers[2]._id,
        supplierName: suppliers[2].name,
        manufacturingDate: monthsAgo(4),
        expiryDate: monthsAhead(24),
        minimumStockLevel: 50,
        batchNumber: 'N95-FLT-2024',
        location: 'PPE Central Locker',
      },
      {
        productId: 'GEN-3004',
        name: 'Povidone Iodine Antiseptic Solution 10% (500ml)',
        category: 'General Supplies',
        description: 'Topical microbicide for pre-operative and post-operative skin disinfection.',
        quantity: 35,
        unitPrice: 8.5,
        unit: 'Bottles',
        supplier: suppliers[2]._id,
        supplierName: suppliers[2].name,
        manufacturingDate: monthsAgo(14),
        expiryDate: daysAhead(18), // Expiring soon in 18 days!
        minimumStockLevel: 15,
        batchNumber: 'PVD-IOD-500',
        location: 'Bay 1 - Topical Shelf',
      },
    ];

    const createdProducts = await Product.insertMany(productsData);

    console.log('📊 Seeding stock transactions...');
    const transactions = [
      {
        product: createdProducts[0]._id,
        productId: createdProducts[0].productId,
        productName: createdProducts[0].name,
        category: createdProducts[0].category,
        type: 'STOCK_IN',
        quantity: 500,
        previousStock: 0,
        newStock: 500,
        unitPrice: createdProducts[0].unitPrice,
        totalValue: 500 * createdProducts[0].unitPrice,
        performedBy: staffUser._id,
        performedByName: staffUser.name,
        recipientOrSource: suppliers[0].name,
        referenceNumber: 'PO-APEX-8901',
        notes: 'Monthly bulk antibiotics order delivery',
        createdAt: daysAgo(10),
      },
      {
        product: createdProducts[0]._id,
        productId: createdProducts[0].productId,
        productName: createdProducts[0].name,
        category: createdProducts[0].category,
        type: 'STOCK_OUT',
        quantity: 50,
        previousStock: 500,
        newStock: 450,
        unitPrice: createdProducts[0].unitPrice,
        totalValue: 50 * createdProducts[0].unitPrice,
        performedBy: staffUser._id,
        performedByName: staffUser.name,
        recipientOrSource: 'Outpatient Pharmacy (OPD)',
        referenceNumber: 'DISP-OPD-441',
        notes: 'Dispatched to OPD dispensing counter',
        createdAt: daysAgo(5),
      },
      {
        product: createdProducts[3]._id,
        productId: createdProducts[3].productId,
        productName: createdProducts[3].name,
        category: createdProducts[3].category,
        type: 'STOCK_IN',
        quantity: 1000,
        previousStock: 0,
        newStock: 1000,
        unitPrice: createdProducts[3].unitPrice,
        totalValue: 1000 * createdProducts[3].unitPrice,
        performedBy: adminUser._id,
        performedByName: adminUser.name,
        recipientOrSource: suppliers[2].name,
        referenceNumber: 'INV-BIO-9923',
        notes: 'Direct hospital replenishment for IV bags',
        createdAt: daysAgo(7),
      },
      {
        product: createdProducts[3]._id,
        productId: createdProducts[3].productId,
        productName: createdProducts[3].name,
        category: createdProducts[3].category,
        type: 'STOCK_OUT',
        quantity: 150,
        previousStock: 1000,
        newStock: 850,
        unitPrice: createdProducts[3].unitPrice,
        totalValue: 150 * createdProducts[3].unitPrice,
        performedBy: staffUser._id,
        performedByName: staffUser.name,
        recipientOrSource: 'Intensive Care Unit (ICU)',
        referenceNumber: 'REQ-ICU-102',
        notes: 'Emergency IV stock allocation for ICU Wing A',
        createdAt: daysAgo(2),
      },
      {
        product: createdProducts[4]._id,
        productId: createdProducts[4].productId,
        productName: createdProducts[4].name,
        category: createdProducts[4].category,
        type: 'STOCK_OUT',
        quantity: 20,
        previousStock: 28,
        newStock: 8,
        unitPrice: createdProducts[4].unitPrice,
        totalValue: 20 * createdProducts[4].unitPrice,
        performedBy: staffUser._id,
        performedByName: staffUser.name,
        recipientOrSource: 'Emergency Room (ER)',
        referenceNumber: 'REQ-ER-778',
        notes: 'Restocked Emergency Room crash carts. Stock is now low.',
        createdAt: daysAgo(1),
      },
      {
        product: createdProducts[11]._id,
        productId: createdProducts[11].productId,
        productName: createdProducts[11].name,
        category: createdProducts[11].category,
        type: 'STOCK_OUT',
        quantity: 40,
        previousStock: 160,
        newStock: 120,
        unitPrice: createdProducts[11].unitPrice,
        totalValue: 40 * createdProducts[11].unitPrice,
        performedBy: staffUser._id,
        performedByName: staffUser.name,
        recipientOrSource: 'Surgical Wards & Theatres',
        referenceNumber: 'DISP-OT-551',
        notes: 'Weekly sterile gloves distribution',
        createdAt: daysAgo(3),
      },
    ];

    await StockTransaction.insertMany(transactions);

    console.log('✅ Database seeded successfully!');
    console.log('\n=============================================');
    console.log('🏥 HOSPITAL STOCK MANAGEMENT SYSTEM');
    console.log('=============================================');
    console.log('Default Accounts for Testing:');
    console.log('1. Hospital Admin:');
    console.log('   Email:    admin@hospital.com');
    console.log('   Password: admin123');
    console.log('2. Inventory Staff:');
    console.log('   Email:    staff@hospital.com');
    console.log('   Password: staff123');
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during database seed:', error);
    process.exit(1);
  }
};

seedDatabase();
