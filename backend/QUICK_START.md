# Quick Start Guide - E-book Backend

## 📦 What Has Been Set Up

Your backend is now fully structured as a production-ready MERN application with:
- ✅ Database models (User, Book, Order, Review, Payment)
- ✅ Authentication & authorization system
- ✅ Comprehensive middleware
- ✅ Error handling
- ✅ Input validation
- ✅ Email service templates
- ✅ Payment integration ready
- ✅ Professional folder structure

## 🚀 Getting Started in 5 Steps

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Set Up Environment Variables
```bash
# Create .env file from template
cp .env.example .env

# Edit .env and configure:
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ebook-marketplace
JWT_SECRET=your-super-secret-key-here
```

### Step 3: Start MongoDB
```bash
# If using local MongoDB
mongod

# If using MongoDB Atlas, just ensure MONGODB_URI is set in .env
```

### Step 4: Start Development Server
```bash
npm run dev
```

You should see:
```
✓ Server started on port 5000
✓ Environment: development
✓ MongoDB Connected: localhost
```

### Step 5: Test the Server
```bash
# In another terminal
curl http://localhost:5000/api/v1/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-04-03T10:30:00.000Z"
}
```

## 📚 Database Models Overview

### 1. User Model
- Roles: admin, publisher, reader
- Fields: name, email, password (hashed), address, phone
- Features: Email verification, password reset, publisher info

### 2. Book Model
- Fields: title, author, description, price, pages
- Supports: PDF, EPUB, MOBI files
- Features: Ratings, reviews, discounts, categories

### 3. Order Model
- Contains: Multiple books, prices, taxes, discounts
- Tracks: Order status, payment status, addresses
- Auto-generates: Order numbers (ORD-YYYY-000001)

### 4. Review Model
- Ratings: 1-5 stars
- Features: Verified purchase badge, helpful/unhelpful counts
- Admin approval required before publishing

### 5. Payment Model
- Supports: Credit card, Debit card, PayPal, Stripe
- Tracks: Transaction IDs, receipts, refunds
- Integration: Ready for Stripe, PayPal, Razorpay

## 🔑 Key Endpoints (To Be Implemented)

```
Authentication
GET  /api/v1/health                    - Health check
POST /api/v1/auth/register             - Register user
POST /api/v1/auth/login                - Login user
POST /api/v1/auth/refresh-token        - Refresh JWT token

Books
GET  /api/v1/books                     - List all books
GET  /api/v1/books/:id                 - Get book details
POST /api/v1/books                     - Create book (Publisher)
PUT  /api/v1/books/:id                 - Update book (Publisher)

Orders
GET  /api/v1/orders                    - List user orders
POST /api/v1/orders                    - Create order
GET  /api/v1/orders/:id                - Get order details

Users
GET  /api/v1/users/profile             - Get user profile
PUT  /api/v1/users/profile             - Update profile

Admin
GET  /api/v1/admin/dashboard           - Dashboard stats
GET  /api/v1/admin/users               - Manage users
GET  /api/v1/admin/books               - Manage books
```

## 🔐 Authentication

Requests require JWT token in header:
```
Authorization: Bearer <your_jwt_token>
```

Example:
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
     http://localhost:5000/api/v1/users/profile
```

## 📝 File Structure Explanation

```
backend/
├── server.js                  # Main entry point
├── package.json              # Dependencies
├── .env.example             # Configuration template
├── .gitignore               # Git ignore rules
├── README.md                # Full documentation
├── SETUP_SUMMARY.md         # Setup summary
│
├── src/
│   ├── config/
│   │   ├── database.js      # MongoDB connection
│   │   └── constants.js     # App constants & enums
│   │
│   ├── models/
│   │   ├── User.js          # User schema
│   │   ├── Book.js          # Book schema
│   │   ├── Order.js         # Order schema
│   │   ├── Review.js        # Review schema
│   │   ├── Payment.js       # Payment schema
│   │   └── index.js         # Export all models
│   │
│   ├── middlewares/
│   │   ├── auth.js          # JWT & role-based access
│   │   ├── errorHandler.js  # Error handling
│   │   └── common.js        # Utilities (logging, CORS)
│   │
│   ├── utils/
│   │   ├── tokenUtils.js    # JWT token generation
│   │   ├── emailService.js  # Email sending
│   │   └── helpers.js       # Helper functions
│   │
│   ├── validators/
│   │   └── validation.js    # Input validation rules
│   │
│   ├── controllers/         # To be implemented
│   │   └── README.md
│   │
│   └── routes/             # To be implemented
│       └── README.md
```

## 🛠️ Development Workflow

### To Add a New Feature:

1. **Create Controller** (src/controllers/featureController.js)
   - Handle business logic
   - Use `asyncHandler` for error handling
   - Return consistent response format

2. **Create Routes** (src/routes/featureRoutes.js)
   - Define endpoints
   - Add validation
   - Add authentication middleware

3. **Add Validation** (if needed in src/validators/validation.js)
   - Define validation rules
   - Use express-validator

4. **Register in server.js**
   - Import the routes
   - Add to app.use()

5. **Test Endpoints**
   - Use Postman, curl, or Thunder Client
   - Test with valid and invalid data

## 💡 Important Notes

1. **Password Security**
   - Passwords are automatically hashed with bcryptjs
   - Never store plain passwords
   - Always use req.user.matchPassword() to verify

2. **JWT Tokens**
   - Default expiration: 7 days
   - Change JWT_SECRET in .env for production
   - Use strong, random secret

3. **Database**
   - All models have proper indexing for performance
   - Relationships use MongoDB references
   - Indexes speed up queries

4. **Error Handling**
   - Centralized in errorHandler middleware
   - No sensitive data in error messages
   - Proper HTTP status codes

5. **Validation**
   - All inputs are validated before processing
   - Prevents injection attacks
   - Provides clear error messages

## 🐛 Troubleshooting

### MongoDB Connection Error
```
✗ MongoDB Connection Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** 
- Make sure MongoDB is running: `mongod`
- Or update MONGODB_URI to use MongoDB Atlas

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
- Change PORT in .env: `PORT=5001`
- Or kill process: `lsof -i :5000` then `kill -9 <PID>`

### JWT Token Issues
```
Not authorized to access this route
```
**Solution:**
- Make sure token is included in Authorization header
- Format: `Authorization: Bearer <token>`
- Token may have expired, get new one from login

### Validation Errors
```
"Validation error: Email is invalid"
```
**Solution:**
- Check request body format
- Ensure all required fields are provided
- Follow the validation rules defined

## 📚 Next Phase: Building Controllers

After verifying the setup works, the next step is implementing controllers for:
1. Authentication (register, login)
2. Books (CRUD operations)
3. Orders (creation and management)
4. Users (profile management)
5. Reviews (rating system)
6. Payments (payment processing)
7. Admin (dashboard and management)

See SETUP_SUMMARY.md for detailed implementation order.

## 📞 Support Resources

- MongoDB Documentation: https://docs.mongodb.com/
- Express.js Guide: https://expressjs.com/
- JWT Reference: https://jwt.io/
- Mongoose Documentation: https://mongoosejs.com/

---

**Your backend is ready to use! Start the server with `npm run dev` and begin testing endpoints.**
