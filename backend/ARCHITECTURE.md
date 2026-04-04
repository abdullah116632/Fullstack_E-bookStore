# E-book Marketplace Backend - Architecture Overview

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (React Frontend)                      │
│                    http://localhost:3000                              │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 │ HTTP Requests
                                 │ (JSON)
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    NODE.JS / EXPRESS SERVER                          │
│                     localhost:5000                                    │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    REST API Routes                           │   │
│  │  /api/v1/auth   /api/v1/books  /api/v1/orders  /api/v1/...  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│  ┌──────────────────────────▼──────────────────────────────────┐   │
│  │              MIDDLEWARE STACK                               │   │
│  │  • CORS & Headers                                           │   │
│  │  • Body Parser (JSON)                                       │   │
│  │  • Request Logger                                           │   │
│  │  • Authentication (JWT)                                     │   │
│  │  • Authorization (Roles)                                    │   │
│  │  • Validation (Input Validation)                            │   │
│  │  • Error Handler                                            │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│  ┌──────────────────────────▼──────────────────────────────────┐   │
│  │           CONTROLLERS (Business Logic)                      │   │
│  │  • authController    - User registration & login            │   │
│  │  • bookController    - Book CRUD operations                 │   │
│  │  • orderController   - Order management                     │   │
│  │  • userController    - User profile management              │   │
│  │  • reviewController  - Review management                    │   │
│  │  • paymentController - Payment processing                   │   │
│  │  • adminController   - Admin operations                     │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│  ┌──────────────────────────▼──────────────────────────────────┐   │
│  │            MODELS (Data Schema)                             │   │
│  │  • User    - Admins, Publishers, Readers                    │   │
│  │  • Book    - Digital books (PDF, EPUB, MOBI)                │   │
│  │  • Order   - Book purchases                                 │   │
│  │  • Review  - Book ratings & comments                        │   │
│  │  • Payment - Transaction records                            │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────┬────────────────────────────────────┘
                                 │
                    Database Queries & Updates
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       MONGODB DATABASE                              │
│                    localhost:27017                                   │
│                                                                       │
│  Collections:                                                        │
│  • users        - User accounts and profiles                         │
│  • books        - Book catalog & details                             │
│  • orders       - Purchase orders                                    │
│  • reviews      - Book reviews & ratings                             │
│  • payments     - Payment transactions                               │
│                                                                       │
│  Indexes:                                                            │
│  • User (email, role, isActive)                                      │
│  • Book (publisher, category, status, title, author)                 │
│  • Order (buyer, status, createdAt)                                  │
│  • Review (book, reviewer, status)                                   │
│  • Payment (user, order, status, transactionId)                      │
└─────────────────────────────────────────────────────────────────────┘


External Services:
│
├── Stripe (Payment Processing) → Payment Controller
├── PayPal (Alternative Payments) → Payment Controller  
├── SMTP Server (Email) → Email Service
└── AWS S3 (File Storage) → File Upload Service
```

## 📊 Data Flow Examples

### 1. User Registration Flow
```
User submits form
    ↓
Frontend POST /api/v1/auth/register
    ↓
Server receives request
    ↓
Validation Middleware → Checks email, password requirements
    ↓
Auth Controller → Creates User, Hashes password
    ↓
User Model → Saves to MongoDB
    ↓
Email Service → Sends welcome email
    ↓
Server returns JWT token & user data
    ↓
Frontend stores token, redirects to dashboard
```

### 2. Book Purchase Flow
```
Reader selects books
    ↓
Frontend POST /api/v1/orders
    ↓
Auth Middleware → Verifies JWT token
    ↓
Validation → Checks books and payment details
    ↓
Order Controller → Creates order
    ↓
Order Model → Saves to MongoDB
    ↓
Payment Controller → Processes payment (Stripe)
    ↓
Payment Model → Records transaction
    ↓
Email Service → Sends order confirmation
    ↓
Order status → Marked as completed
    ↓
Frontend displays download link
```

### 3. Book Publishing Flow
```
Publisher uploads book
    ↓
Frontend POST /api/v1/books (with JWT token)
    ↓
Auth Middleware → Verifies token, checks role = 'publisher'
    ↓
Validation → Book details, file validation
    ↓
File Upload → Saves PDF/EPUB to storage
    ↓
Book Controller → Creates book record
    ↓
Book Model → Saves to MongoDB (status: draft)
    ↓
Publisher edits and publishes
    ↓
Book Model → Updates status: published
    ↓
Book appears in store
```

## 🔐 Security Layers

```
┌─ Input Validation Layer
│  └─ Express-validator → Prevents invalid data
│
├─ Authentication Layer
│  └─ JWT Middleware → Verifies user identity
│
├─ Authorization Layer
│  └─ Role-based middleware → Checks user permissions
│
├─ Database Layer
│  └─ Mongoose validation & indexing
│
└─ Application Layer
   └─ Error handling → No sensitive data leakage
```

## 💾 Database Relationships

```
Users (1) ──────── (Many) Books
 │                    └──── Reviewed by Reviews
 │                    └──── Sold through Orders
 │
 ├──── (1) Admin
 │
 ├──── (Many) Orders ──── (Many) Books
 │                           │
 │                           └──── Paid through Payments
 │
 └──── (Many) Reviews ──── Books

Key Relationships:
• One user can be Admin/Publisher/Reader
• One publisher can create many books
• One book can be in many orders
• One order contains many books
• One payment belongs to one order
• One review belongs to one book and one reviewer
```

## 🔄 Request/Response Cycle

```
1. CLIENT REQUEST
   ├─ Headers: Authorization: Bearer <JWT>
   ├─ Method: GET, POST, PUT, DELETE, PATCH
   ├─ URL: /api/v1/endpoint
   └─ Body: {JSON data}

2. SERVER RECEIVES
   ├─ CORS Check ✓
   ├─ Parse JSON ✓
   ├─ Log request ✓
   └─ Route matching

3. MIDDLEWARE CHAIN
   ├─ Input Validation
   │  └─ Return 400 if invalid ✗
   │
   ├─ Authentication
   │  └─ Return 401 if no token ✗
   │
   ├─ Authorization
   │  └─ Return 403 if insufficient role ✗
   │
   └─ Continue to controller

4. CONTROLLER LOGIC
   ├─ Process request
   ├─ Call database
   ├─ Perform calculations
   └─ Prepare response

5. DATABASE OPERATIONS
   ├─ Query validation
   ├─ Data retrieval/storage
   └─ Return results

6. SERVER RESPONSE
   ├─ Format response
   ├─ Set status code
   ├─ Add headers
   └─ Send JSON

7. CLIENT RECEIVES
   ├─ Status: 200, 400, 401, 500, etc.
   ├─ Body: {success, message, data}
   └─ Token refresh if needed
```

## 📦 Folder Responsibilities

```
backend/
├── server.js
│   └─ Express app setup, middleware configuration, route registration
│
├── src/config/
│   ├─ database.js → MongoDB connection
│   └─ constants.js → Enums and constants
│
├── src/models/
│   ├─ User.js → User schema and methods
│   ├─ Book.js → Book schema with indexing
│   ├─ Order.js → Order with auto-numbering
│   ├─ Review.js → Review schema
│   ├─ Payment.js → Payment tracking
│   └─ index.js → Export all models
│
├── src/controllers/
│   ├─ authController.js → User auth logic
│   ├─ bookController.js → Book CRUD logic
│   ├─ orderController.js → Order management
│   ├─ userController.js → User management
│   ├─ reviewController.js → Review management
│   ├─ paymentController.js → Payment processing
│   └─ adminController.js → Admin operations
│
├── src/routes/
│   ├─ authRoutes.js → Auth endpoints
│   ├─ bookRoutes.js → Book endpoints
│   ├─ orderRoutes.js → Order endpoints
│   ├─ userRoutes.js → User endpoints
│   ├─ reviewRoutes.js → Review endpoints
│   ├─ paymentRoutes.js → Payment endpoints
│   └─ adminRoutes.js → Admin endpoints
│
├── src/middlewares/
│   ├─ auth.js → JWT & role protection
│   ├─ errorHandler.js → Error handling
│   └─ common.js → CORS, logging, validation
│
├── src/validators/
│   └─ validation.js → Express-validator rules
│
├── src/utils/
│   ├─ tokenUtils.js → JWT generation
│   ├─ emailService.js → Email sending
│   └─ helpers.js → Helper functions
│
└── Documentation
    ├─ README.md → Full API documentation
    ├─ QUICK_START.md → Getting started
    ├─ SETUP_SUMMARY.md → Setup checklist
    └─ ARCHITECTURE.md → This file
```

## 🔗 API Endpoint Structure

```
BASE URL: http://localhost:5000/api/v1

Authentication
├─ POST   /auth/register          Create new user
├─ POST   /auth/login             Login user
├─ POST   /auth/logout            Logout user
├─ POST   /auth/refresh-token     Get new token
├─ POST   /auth/forgot-password   Request reset
└─ PUT    /auth/reset-password/:id Reset password

Books (Protected)
├─ GET    /books                  List all books
├─ GET    /books/:id              Get book detail
├─ POST   /books                  Create book (Publisher)
├─ PUT    /books/:id              Update book (Publisher)
└─ DELETE /books/:id              Delete book (Publisher)

Orders (Protected)
├─ GET    /orders                 List user orders
├─ GET    /orders/:id             Get order detail
├─ POST   /orders                 Create order
└─ PUT    /orders/:id             Update order (Admin)

Users (Protected)
├─ GET    /users/profile          Get current user
├─ PUT    /users/profile          Update profile
├─ GET    /users                  List users (Admin)
└─ DELETE /users/:id              Delete user (Admin)

Reviews (Protected)
├─ GET    /books/:id/reviews      List book reviews
├─ POST   /books/:id/reviews      Create review
├─ PUT    /reviews/:id            Update review
└─ DELETE /reviews/:id            Delete review

Payments (Protected)
├─ POST   /payments               Create payment
├─ GET    /payments/:id           Get payment status
└─ POST   /payments/webhook       Stripe webhook

Admin (Protected - Admin only)
├─ GET    /admin/dashboard        Dashboard stats
├─ GET    /admin/users            Manage users
├─ GET    /admin/books            Manage books
├─ GET    /admin/orders           Manage orders
└─ GET    /admin/payments         Manage payments
```

## ✅ Key Features Implementation Status

```
✅ COMPLETED
├─ Database models with relationships
├─ Authentication middleware
├─ Authorization with roles
├─ Error handling
├─ Input validation
├─ Email service templates
├─ JWT token utilities
├─ Helper functions
├─ Production-ready structure
└─ Comprehensive documentation

⏳ TO BE IMPLEMENTED
├─ Auth Controller (register, login, password reset)
├─ Book Controller (CRUD operations)
├─ Order Controller (order management)
├─ User Controller (profile management)
├─ Review Controller (review management)
├─ Payment Controller (Stripe/PayPal integration)
├─ Admin Controller (dashboard & management)
├─ File upload middleware (multer setup)
├─ Rate limiting middleware
├─ Caching layer (Redis)
├─ API documentation (Swagger/OpenAPI)
└─ Unit & integration tests
```

## 🚀 Deployment Considerations

```
Development
├─ NODE_ENV=development
├─ Debug logging enabled
├─ CORS: * or localhost:3000
└─ MongoDB: local or Atlas test

Production
├─ NODE_ENV=production
├─ Logging to files
├─ CORS: specific domain only
├─ MongoDB: Atlas production cluster
├─ Secrets: Environment variables
├─ HTTPS: Required
├─ Rate limiting: Enabled
├─ Security headers: Implemented
└─ Monitoring: Error tracking (Sentry)
```

---

This architecture provides a scalable, secure, and maintainable foundation for your e-book marketplace platform.
