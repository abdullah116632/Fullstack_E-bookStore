# Authentication System Overview

## Architecture

The E-book marketplace uses a **three-tier authentication system** with separate user models and independent authentication flows for Readers, Publishers, and Admins.

```
┌─────────────────────────────────────────────────────────────┐
│                    HTTP Request                             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │  Express Server    │
        │   (server.js)      │
        └────────┬───────────┘
                 │
                 ├─────────────────────────────────────┐
                 │                                     │
                 ▼                                     ▼
    ┌─────────────────────────┐        ┌──────────────────────────┐
    │ Reader Auth Routes      │        │ Publisher Auth Routes    │
    │ /api/v1/auth/reader     │        │ /api/v1/auth/publisher   │
    └────────────┬────────────┘        └──────────────┬───────────┘
                 │                                    │
                 ▼                                    ▼
    ┌─────────────────────────┐      ┌───────────────────────────┐
    │ readerAuthController    │      │publisherAuthController  │
    │ (9 endpoints)           │      │ (9 endpoints)           │
    └────────────┬────────────┘      └───────────────┬──────────┘
                 │                                   │
                 ▼                                   ▼
            ┌────────────┐                      ┌─────────────┐
            │ Reader     │ ◄──────DB Connection─► │ Publisher  │
            │ Model      │                      │ Model       │
            └────────────┘                      └─────────────┘

                 │                                   │
                 └─────────────────┬─────────────────┘
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │   MongoDB Atlas      │
                        │   (Database)         │
                        └──────────────────────┘

    ┌──────────────────────────────────────────────────────────┐
    │ Admin Auth Routes /api/v1/auth/admin                     │
    │ adminAuthController (6 endpoints) → Admin Model (MongoDB)│
    └──────────────────────────────────────────────────────────┘
```

---

## User Models Comparison

| Feature | Reader | Publisher | Admin |
|---------|--------|-----------|-------|
| **Signup Flow** | ✅ Self signup | ✅ Self signup | ❌ Pre-created |
| **Email Verification** | ✅ OTP required | ✅ OTP required | ✅ Pre-verified |
| **Admin Approval** | ❌ None | ✅ Required | N/A |
| **Login Available** | After email verify | After email verify + approval | Always |
| **Key Fields** | fullName, email | publisherName, address, phone | phone, fullName |
| **Profile Updates** | fullName | fullName, publisherName, address | Read-only |
| **Password Reset** | ✅ OTP method | ✅ OTP method | ✅ OTP method |

---

## Authentication Flows

### 1. Reader Authentication Flow

```
┌─────────────────┐
│  Reader Signup  │
└────────┬────────┘
         │
         ▼
   ┌─────────────────────┐
   │ Provide Details:    │
   │ - fullName          │
   │ - email             │
   │ - password          │
   └────────┬────────────┘
            │
            ▼
   ┌──────────────────────┐
   │ Generate OTP         │
   │ (6 digits, 10 min)   │
   └────────┬─────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │ Send OTP via Email       │
   │ (Resend API)             │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │ Verify OTP               │
   │ (5 attempts allowed)     │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │ Email Verified ✓         │
   │ Account Active           │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │ Ready to Login           │
   └──────────────────────────┘
```

### 2. Publisher Authentication Flow

```
┌──────────────────┐
│ Publisher Signup │
└────────┬─────────┘
         │
         ▼
   ┌──────────────────────────┐
   │ Provide Business Details │
   │ - fullName               │
   │ - email                  │
   │ - publisherName          │
   │ - phoneNumber            │
   │ - address (full)         │
   │ - password               │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │ Account Created          │
   │ isApproved = false       │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │ Send OTP via Email       │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │ Verify OTP               │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │ Email Verified ✓         │
   │ Awaiting Admin Approval   │
   └────────┬─────────────────┘
            │
            ▼ (Admin reviews & approves)
   ┌──────────────────────────┐
   │ isApproved = true        │
   │ Ready to Login           │
   └──────────────────────────┘
```

### 3. Admin Authentication Flow

```
┌────────────────┐
│ Admin Login    │
│ (Pre-created)  │
└────────┬───────┘
         │
         ▼
   ┌──────────────────────┐
   │ Provide Credentials  │
   │ - email              │
   │ - password           │
   └────────┬─────────────┘
            │
            ▼
   ┌────────────────────────────────┐
   │ Verify Password                │
   │ (Email already verified)       │
   │ (isActive check)               │
   └────────┬───────────────────────┘
            │
            ▼
   ┌──────────────────────┐
   │ Generate JWT Token   │
   │ (7-day expiry)       │
   └────────┬─────────────┘
            │
            ▼
   ┌──────────────────────┐
   │ Return Token         │
   │ Access Granted ✓     │
   └──────────────────────┘
```

### 4. Password Reset Flow (All Users)

```
┌─────────────────────────┐
│ Forgot Password Request │
└────────┬────────────────┘
         │
         ▼
   ┌──────────────────────┐
   │ Provide Email        │
   │ (Security: No email  │
   │  enumeration)        │
   └────────┬─────────────┘
            │
            ▼
   ┌──────────────────────┐
   │ Generate Reset OTP   │
   │ (6 digits, 10 min)   │
   └────────┬─────────────┘
            │
            ▼
   ┌──────────────────────┐
   │ Send OTP via Email   │
   └────────┬─────────────┘
            │
            ▼
   ┌──────────────────────┐
   │ Verify Reset OTP     │
   │ (5 attempts)         │
   └────────┬─────────────┘
            │
            ▼
   ┌──────────────────────┐
   │ Reset Password       │
   │ (Hashed & Saved)     │
   └────────┬─────────────┘
            │
            ▼
   ┌──────────────────────┐
   │ Login with Password  │
   └──────────────────────┘
```

---

## API Endpoint Structure

### Base Paths
```
/api/v1/auth/reader       → Reader endpoints
/api/v1/auth/publisher    → Publisher endpoints
/api/v1/auth/admin        → Admin endpoints
```

### Endpoint Categories

#### Public Endpoints (No Authentication)
- `POST /signup` - Create new account
- `POST /verify-signup` - Verify signup OTP
- `POST /login` - Authenticate user
- `POST /forgot-password` - Request password reset
- `POST /verify-reset-otp` - Verify reset OTP
- `POST /reset-password` - Set new password

#### Protected Endpoints (RequireJWT Token)
- `PUT /update-password` - Change password while authenticated
- `PUT /profile` - Update profile information (Reader: only fullName, Publisher: extended fields)
- `GET /profile` - Retrieve profile information

---

## Authentication Mechanism

### JWT Token Generation
```javascript
// Generated upon successful login or signup verification
Token Format: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Payload Contains:
{
  id: user._id,        // User's MongoDB ObjectId
  type: 'user',        // User type identifier
  iat: timestamp,      // Issued at
  exp: timestamp + 7d  // Expires in 7 days
}
```

### Token Usage
```bash
Authorization: Bearer <jwt_token>

# Example:
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
     http://localhost:5000/api/v1/auth/reader/profile
```

### Token Validation
- Middleware `protect()` validates token on protected routes
- Checks token expiry (7 days)
- Verifies signature using JWT_SECRET
- Looks up user in appropriate model (Reader/Publisher/Admin)

---

## Security Features

### Password Security
- **Hashing:** bcryptjs with salt rounds (pre-save hook in Mongoose)
- **Never returned:** Password hash never included in API responses
- **Comparison:** Hashed comparison using `matchPassword()` method
- **Update:** Only changed via authenticated update-password endpoint or verified OTP reset

### OTP Security
- **Format:** 6-digit random string
- **Generation:** Cryptographically secure random generation
- **Expiry:** 10 minutes from generation
- **Attempts:** Maximum 5 verification attempts, auto-deletion after exceeding
- **Storage:** Stored in database, not returned to client

### Email Verification
- **Mandatory:** Email OTP verification required before any user can access account
- **Resend API:** Industry-standard email service
- **One-time:** OTP becomes invalid after successful verification
- **Retry:** Users can request new OTP if expired

### Admin Approval
- **Publisher-specific:** Admin must approve publisher accounts before login
- **isApproved flag:** Set by admin through separate admin endpoints
- **Login blocking:** Login endpoint checks isApproved before granting access
- **User feedback:** Clear messages indicate approval waiting status

### Rate Limiting OTPs
- **Max attempts:** 5 attempts per OTP
- **Auto-cleanup:** Records deleted after exceeding attempts
- **Time-based:** Automatic expiry after 10 minutes
- **Prevention:** Brute-force attacks mitigated by attempt limiting

### Email Enumeration Prevention
- **Forgot password:** Same success response whether email exists or not
- **No disclosure:** Application never confirms/denies email existence
- **Security impact:** Prevents attacker from discovering valid emails

---

## Error Handling

### Validation Errors (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

### Authentication Errors (401)
```json
{
  "success": false,
  "message": "Invalid email or password."
}
```

### Not Found Errors (404)
```json
{
  "success": false,
  "message": "Reader not found."
}
```

### Conflict Errors (409)
```json
{
  "success": false,
  "message": "Email already registered. Please login or use a different email."
}
```

### Server Errors (500)
```json
{
  "success": false,
  "message": "Failed to send OTP email. Please try again."
}
```

---

## Database Schema Overview

### Reader Schema
```javascript
{
  fullName: String (required),
  email: String (unique, required),
  password: String (hashed, required),
  isEmailVerified: Boolean (default: false),
  signupOTP: {
    code: String,
    expiresAt: Date,
    attempts: Number
  },
  resetOTP: {
    code: String,
    expiresAt: Date,
    attempts: Number
  },
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Publisher Schema
```javascript
{
  fullName: String (required),
  email: String (unique, required),
  password: String (hashed, required),
  publisherName: String (required),
  phoneNumber: String (required),
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  isEmailVerified: Boolean (default: false),
  isApproved: Boolean (default: false),  // Admin approval required
  signupOTP: { ... },
  resetOTP: { ... },
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Admin Schema
```javascript
{
  fullName: String (required),
  email: String (unique, required),
  password: String (hashed, required),
  phoneNumber: String (required),
  isEmailVerified: Boolean (default: true),  // Pre-verified
  resetOTP: {
    code: String,
    expiresAt: Date,
    attempts: Number
  },
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Implementation Checklist

### ✅ Completed
- [x] Three user models with appropriate fields
- [x] Reader authentication (9 endpoints)
- [x] Publisher authentication (9 endpoints)
- [x] Admin authentication (6 endpoints)
- [x] OTP generation and validation
- [x] JWT token generation and verification
- [x] Password hashing with bcryptjs
- [x] Email service integration (Resend)
- [x] Input validation (express-validator)
- [x] Error handling middleware
- [x] Auth middleware (JWT verification)
- [x] Separate route files by user type
- [x] API documentation (3 files)

### ⏳ Pending
- [ ] Admin endpoint to approve publishers
- [ ] Admin endpoint to deactivate accounts
- [ ] Email OTP resend functionality
- [ ] Rate limiting middleware
- [ ] CORS configuration per user type
- [ ] Integration tests
- [ ] Postman collection
- [ ] API rate limiting

---

## Testing Recommendations

### 1. Reader Flow Testing
```bash
# Signup
POST /api/v1/auth/reader/signup
→ Should receive OTP in email

# Verify Signup
POST /api/v1/auth/reader/verify-signup
→ Should activate account

# Login
POST /api/v1/auth/reader/login
→ Should return JWT token

# Protected Endpoint
GET /api/v1/auth/reader/profile (with token)
→ Should return user profile
```

### 2. Publisher Flow Testing
```bash
# Signup with extended fields
POST /api/v1/auth/publisher/signup
→ Should receive OTP, await approval

# Verify Signup
POST /api/v1/auth/publisher/verify-signup
→ Should show pending approval

# Attempt Login (before approval)
POST /api/v1/auth/publisher/login
→ Should fail with "awaiting approval" message

# Admin Approval (separate endpoint - TBD)
Admin approves → isApproved = true

# Login (after approval)
POST /api/v1/auth/publisher/login
→ Should return JWT token
```

### 3. Admin Flow Testing
```bash
# Setup: Admin account pre-created in database

# Login
POST /api/v1/auth/admin/login
→ Should return JWT token immediately

# Protected Endpoint
GET /api/v1/auth/admin/profile (with token)
→ Should return admin profile

# Forgot Password
POST /api/v1/auth/admin/forgot-password
→ Should send OTP via email
```

---

## Environment Variables

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ebook-db

# JWT
JWT_SECRET=your_super_secret_key_min_32_characters

# Email Service
RESEND_API_KEY=your_resend_api_key

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

---

## File Structure

```
backend/
├── config/
│   ├── database.js
│   └── constants.js
├── models/
│   ├── Reader.js
│   ├── Publisher.js
│   ├── Admin.js
│   ├── Book.js
│   ├── Order.js
│   ├── Review.js
│   └── Payment.js
├── controllers/
│   ├── readerAuthController.js
│   ├── publisherAuthController.js
│   └── adminAuthController.js
├── routes/
│   ├── readerAuthRoutes.js
│   ├── publisherAuthRoutes.js
│   └── adminAuthRoutes.js
├── middlewares/
│   ├── auth.js
│   ├── errorHandler.js
│   └── common.js
├── utils/
│   ├── emailService.js
│   ├── tokenUtils.js
│   └── helpers.js
├── validators/
│   └── validation.js
├── server.js
├── .env
├── package.json
├── READER_API.md
├── PUBLISHER_API.md
└── ADMIN_API.md
```

---

## Next Phase Features

### Publisher Management
- [ ] Book upload and management
- [ ] Sales dashboard
- [ ] Earnings report
- [ ] Social media integration

### Reader Features
- [ ] Book library/wishlist
- [ ] Book search and filters
- [ ] Download/PDF access
- [ ] Reading progress tracking
- [ ] Recommendations

### Admin Dashboard
- [ ] Publisher approval workflow
- [ ] User management
- [ ] System analytics
- [ ] Report generation
- [ ] Payment settlement

---

## References

- **JWT Token:** https://tools.ietf.org/html/rfc7519
- **bcryptjs:** https://www.npmjs.com/package/bcryptjs
- **Resend Email:** https://resend.com/docs
- **Express Validator:** https://express-validator.github.io/docs/
- **Mongoose:** https://mongoosejs.com/docs/
