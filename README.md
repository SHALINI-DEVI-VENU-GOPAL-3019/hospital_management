# 🏥 Hospital Stock Management System (MediStock Pro)

A modern, full-stack **MERN (MongoDB Atlas, Express.js, React.js with Vite, Node.js)** hospital inventory and medical supplies management application. Designed with a clean healthcare aesthetic (navy blue, light blue, white), robust role-based authentication, real-time stock telemetry, automated low-stock and expiry warnings, and audit-ready reporting.

---

## 🌟 Key Features

### 1. 🛡️ Authentication & Role-Based Access Control
- **User Roles:** `Hospital Admin` and `Inventory Staff`.
- **JWT Authentication:** Secure tokens stored and verified on protected API routes.
- **Password Security:** Salted hashing with `bcryptjs`.
- **Pre-configured Test Accounts:** Built-in one-click demo credentials on the login screen.

### 2. 📊 Dynamic Hospital Dashboard
- **Real-time Telemetry:**
  - Total Products & Total Medicines count.
  - Medical Equipment & General Supplies breakdown.
  - Available Usable Stock (automatically excludes expired items for clinical safety).
  - Low-stock and Quarantined / Expired metrics.
  - Total hospital inventory capital valuation.
- **Interactive Charts (Recharts):**
  - **Stock Activity Trends (7-Day Area Chart):** Inbound vs. Outbound unit volume.
  - **Category-wise Stock Distribution (Donut Chart):** Interactive breakdown by medical category.
- **High-Priority Alert Banners:** Immediate alerts for items below safe threshold or nearing expiration.
- **Recent Stock Audit Feed:** Live log of the latest 10 inventory transactions.

### 3. 📦 Inventory Management Module (Complete CRUD)
- **Product Registration:** Product ID (SKU), Name, Category (`Medicine`, `Medical Equipment`, `General Supplies`), Unit Price, Quantity, Unit of Measure, Supplier, Manufacturing Date, Expiry Date, Minimum Stock Level, Batch/Lot Number, and Storage Location.
- **Live Search & Filter:** Search by Product Name, ID, Batch, or Supplier; filter by category or stock status (`Low Stock`, `Expired`, `Expiring Soon`, `In Stock`).
- **Sorting:** Sort records dynamically by Name, Stock Quantity, Unit Price, or Expiry Date.
- **Quick Row Actions:** Perform Stock In, Stock Out, View Details, Edit, or Delete directly from each row.
- **CSV Data Export:** Export the entire filtered catalog to a CSV spreadsheet.

### 4. 🔄 Stock Management (Stock In & Stock Out)
- **Stock In (Receiving):** Log arrival of pharmaceuticals or equipment, increase stock count, record invoice/PO reference, source, and batch number.
- **Stock Out (Issuing to Wards):**
  - Issue items to hospital departments (`Emergency Room`, `ICU`, `Surgery/OT`, `OPD`, `Pediatrics`, etc.).
  - **Over-dispensing Guard:** Prevents stock-out operations when requested quantity exceeds available stock, with clear visual error messaging.
- **Stock Audit Ledger:** Tracks previous stock, new stock, quantity changed, user who performed the operation, reference numbers, and timestamps.

### 5. ⏳ Expiry & Quarantine Safety Protocol
- **Safety Dispensing Policy:** Expired medications are flagged with quarantine indicators and excluded from usable stock calculations.
- **Horizon Forecasting:** Filter products nearing expiration within 30, 60, or 90 days.
- **Quarantine Action:** Restock safe fresh batches or execute approved disposal actions.

### 6. 🏢 Supplier & Vendor Directory
- **Supplier Database:** Company Name, Contact Person, Phone, Email, Physical Address, and Contract Status (`Active` / `Inactive`).
- **Product Associations:** View all products supplied by any given vendor.
- **Full CRUD:** Add, update, and manage supplier records.

### 7. 📄 Printable Audit Reports & Analytics
- **Multi-Tabbed Reports:**
  - Complete Inventory Valuation Report.
  - Low-Stock Reorder Deficit Report.
  - Expired & At-Risk Products Audit.
  - Inbound (Stock-In) Log.
  - Outbound (Stock-Out) Dispatch Log.
- **Print Friendly:** Dedicated `@media print` CSS layout for clean hospital printouts and PDF saves.
- **Export to CSV:** One-click spreadsheet download for every active report.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React (Healthcare Icons), Recharts, Axios, React Router v6 |
| **Backend** | Node.js, Express.js, Mongoose ODM, JSON Web Tokens (JWT), bcryptjs, Morgan, CORS, Dotenv |
| **Database** | MongoDB Atlas (Cloud Database) or Local MongoDB |

---

## 📁 Project Structure

```
hospital/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB Atlas connection handler
│   ├── controllers/
│   │   ├── authController.js      # Register, Login, Profile
│   │   ├── productController.js   # Product CRUD, filters, search
│   │   ├── stockController.js     # Stock In, Stock Out, Transaction History
│   │   ├── supplierController.js  # Supplier CRUD & product associations
│   │   ├── dashboardController.js # Dynamic KPI stats & telemetry charts
│   │   └── reportController.js    # Reports (Valuation, Deficit, Expiry, Logs)
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT token guard & role authorization
│   │   └── errorMiddleware.js     # Global error & duplicate key handlers
│   ├── models/
│   │   ├── User.js                # Healthcare staff & admin schema
│   │   ├── Product.js             # Hospital products schema
│   │   ├── Supplier.js            # Vendor & distributor schema
│   │   └── StockTransaction.js    # Immutable transaction audit trail
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── stockRoutes.js
│   │   ├── supplierRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── reportRoutes.js
│   ├── seed/
│   │   └── seedData.js            # Initial realistic hospital dataset
│   ├── .env.example              # Environment variables template
│   ├── .env                      # Active environment configuration
│   ├── package.json
│   └── server.js                 # Express server entry point
├── frontend/
│   ├── public/
│   │   └── hospital-icon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Navbar, Sidebar, MetricCard, Modal, Badges, etc.
│   │   │   ├── dashboard/        # StockLevelChart, CategoryPieChart, RecentActivities, Alerts
│   │   │   ├── inventory/        # ProductFormModal, ProductDetailModal
│   │   │   ├── stock/            # StockInModal, StockOutModal
│   │   │   └── suppliers/        # SupplierModal
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global auth state & token management
│   │   ├── layouts/
│   │   │   ├── DashboardLayout.jsx
│   │   │   └── AuthLayout.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Inventory.jsx
│   │   │   ├── StockManagement.jsx
│   │   │   ├── ExpiryManagement.jsx
│   │   │   ├── Suppliers.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── NotFound.jsx
│   │   ├── services/             # Axios API service clients
│   │   ├── App.jsx               # Protected route tree
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── package.json                  # Root orchestration scripts
├── .gitignore
└── README.md
```

---

## 🚀 Setup & Installation Guide

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)
- A **MongoDB Atlas** account (or local MongoDB installed)

---

### Step 1: Configure MongoDB Atlas Database

1. **Log in or Sign Up** at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. **Create a Free Cluster:** Select the **M0 Shared (Free)** tier and choose your nearest cloud region.
3. **Set Up Database User:**
   - Go to **Security > Database Access**.
   - Click **Add New Database User**.
   - Choose **Password Authentication**, enter a username (e.g. `hospital_admin`) and a secure password.
   - Assign the user **Read and write to any database** privilege.
4. **Configure IP Access:**
   - Go to **Security > Network Access**.
   - Click **Add IP Address**.
   - Choose **Allow Access from Anywhere** (`0.0.0.0/0`) for development, or add your current IP address.
5. **Get Your Connection String:**
   - In **Deployments > Database**, click **Connect**.
   - Choose **Drivers** (Node.js).
   - Copy the SRV connection string:
     ```
     mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/hospital_stock?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with the credentials created in step 3.

---

### Step 2: Configure Environment Variables

1. Open `backend/.env` (or copy from `backend/.env.example`):
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Edit `backend/.env` and insert your MongoDB Atlas URI:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://your_username:your_password@cluster0.abcde.mongodb.net/hospital_stock?retryWrites=true&w=majority
   JWT_SECRET=hospital_stock_jwt_secret_key_production_2026
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

*(Note: If you have a local MongoDB daemon running, `mongodb://127.0.0.1:27017/hospital_stock` works out of the box as well!)*

---

### Step 3: Install Dependencies

From the project root directory:

```bash
# Install backend dependencies
npm install --prefix backend

# Install frontend dependencies
npm install --prefix frontend
```

---

### Step 4: Seed Database with Realistic Hospital Data

Populate the database with pre-configured users, suppliers, medicines, surgical equipment, low-stock alerts, and stock history:

```bash
npm run seed --prefix backend
```

---

### Step 5: Start the Backend Server

```bash
# Start backend in development mode
npm run dev --prefix backend

# Or production start:
npm run start --prefix backend
```

The backend server will run at: **`http://localhost:5000`**  
API Health Check: **`http://localhost:5000/api/health`**

---

### Step 6: Start the Frontend Application

Open a second terminal window:

```bash
npm run dev --prefix frontend
```

The frontend will run at: **`http://localhost:5173`**

---

## 🔐 Default Demo Accounts

For immediate testing, two pre-configured accounts are provided with one-click buttons on the Login page:

| Role | Email | Password | Access Privileges |
|---|---|---|---|
| **Hospital Admin** | `admin@hospital.com` | `admin123` | Full Administrative & Inventory Control |
| **Inventory Staff** | `staff@hospital.com` | `staff123` | Operational Stock In, Out, and Catalog View |

---

## 📡 API Endpoint Reference

### Authentication
- `POST /api/auth/register` - Register a new hospital staff/admin account
- `POST /api/auth/login` - Authenticate and return JWT token
- `GET /api/auth/profile` - Retrieve current logged-in user details

### Products & Inventory
- `GET /api/products` - List products (supports `search`, `category`, `status`, `sortBy`, `sortOrder`)
- `POST /api/products` - Register a new medical product
- `GET /api/products/:id` - Retrieve product details with recent transactions
- `PUT /api/products/:id` - Update product details
- `DELETE /api/products/:id` - Delete product and associated history

### Stock Operations
- `POST /api/stock/in` - Receive inbound stock (increases balance, logs transaction)
- `POST /api/stock/out` - Issue outbound stock to wards (validates quantity, decreases balance)
- `GET /api/stock/history` - Retrieve transaction audit history

### Suppliers
- `GET /api/suppliers` - List all suppliers with product counts
- `POST /api/suppliers` - Register a new supplier
- `GET /api/suppliers/:id` - Retrieve supplier profile and supplied catalog
- `PUT /api/suppliers/:id` - Update supplier information
- `DELETE /api/suppliers/:id` - Remove supplier record

### Dashboard
- `GET /api/dashboard/stats` - Summary cards, weekly trends, category breakdown, and alerts

### Reports
- `GET /api/reports/inventory` - Complete valuation and inventory summary
- `GET /api/reports/low-stock` - Low stock and reorder point deficit calculation
- `GET /api/reports/expired` - Quarantined and nearing-expiry audit
- `GET /api/reports/transactions` - Inbound/outbound transaction logs

---

## 📦 Production Build

To create an optimized production build of the frontend:

```bash
npm run build --prefix frontend
```

The generated production bundle will be located in `frontend/dist/`.
