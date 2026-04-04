# Publisher Authentication API Documentation

## Overview
Complete Publisher authentication and profile management API endpoints. Publishers need admin approval before they can access their accounts after email verification.

**Base URL:** `/api/v1/auth/publisher`
**Authentication:** JWT Bearer Token (returned after login)

---

## 1. Publisher Signup (Send OTP)

**Endpoint:** `POST /signup`
**Authentication:** None (Public)
**Description:** Create a new publisher account and send OTP to email

### Request Body
```json
{
  "fullName": "John Smith",
  "email": "john@publisher.com",
  "password": "SecurePass123",
  "publisherName": "Smith Publishing House",
  "phoneNumber": "+1-234-567-8900",
  "address": {
    "street": "123 Publishing Lane",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

### Request Validation
- `fullName` - Required, minimum 2 characters, string
- `email` - Required, valid email format
- `password` - Required, minimum 6 characters
- `publisherName` - Required, minimum 2 characters
- `phoneNumber` - Required, valid phone format (10+ digits with optional +, -, spaces, parentheses)
- `address.street` - Required, string
- `address.city` - Required, string
- `address.state` - Required, string
- `address.zipCode` - Required, string
- `address.country` - Required, string

### Success Response (201)
```json
{
  "success": true,
  "message": "OTP sent to your email. Please verify to complete signup.",
  "data": {
    "email": "john@publisher.com",
    "message": "Check your email for the 6-digit OTP. Admin approval required after verification."
  }
}
```

### Error Responses

**409 Conflict** - Email already registered
```json
{
  "success": false,
  "message": "Email already registered. Please login or use a different email."
}
```

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "errors": [
      {
        "field": "email",
        "message": "Please provide a valid email"
      },
      {
        "field": "phoneNumber",
        "message": "Please provide a valid phone number"
      }
    ]
  }
}
```

**500 Internal Server Error** - Email service failure
```json
{
  "success": false,
  "message": "Failed to send OTP email. Please try again."
}
```

### cURL Example
```bash
curl -X POST http://localhost:5000/api/v1/auth/publisher/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Smith",
    "email": "john@publisher.com",
    "password": "SecurePass123",
    "publisherName": "Smith Publishing House",
    "phoneNumber": "+1-234-567-8900",
    "address": {
      "street": "123 Publishing Lane",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    }
  }'
```

### Notes
- OTP is valid for 10 minutes
- Maximum 5 OTP verification attempts allowed
- Account marked as inactive until email verified AND admin approved
- Publisher info stored immediately but approval needed before login

---

## 2. Verify Publisher Signup OTP

**Endpoint:** `POST /verify-signup`
**Authentication:** None (Public)
**Description:** Verify the OTP sent to publisher's email

### Request Body
```json
{
  "email": "john@publisher.com",
  "otp": "123456"
}
```

### Request Validation
- `email` - Required, valid email format
- `otp` - Required, exactly 6 digits

### Success Response (200)
```json
{
  "success": true,
  "message": "Email verified successfully. Awaiting admin approval to activate your account.",
  "data": {
    "email": "john@publisher.com",
    "isApproved": false,
    "message": "Admin will review your publisher account and approve it shortly."
  }
}
```

### Error Responses

**404 Not Found** - Publisher not found or already verified
```json
{
  "success": false,
  "message": "Publisher not found or already verified."
}
```

**400 Bad Request** - OTP expired
```json
{
  "success": false,
  "message": "OTP expired. Please signup again."
}
```

**400 Bad Request** - Invalid OTP with attempts remaining
```json
{
  "success": false,
  "message": "Invalid OTP. 4 attempts remaining."
}
```

**400 Bad Request** - Too many attempts exceeded
```json
{
  "success": false,
  "message": "Too many OTP attempts. Please signup again."
}
```

### cURL Example
```bash
curl -X POST http://localhost:5000/api/v1/auth/publisher/verify-signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@publisher.com",
    "otp": "123456"
  }'
```

### Notes
- OTP must be verified within 10 minutes of signup
- After exceeding 5 attempts, account is deleted and must signup again
- A welcome email is sent upon successful verification
- Publisher cannot login until admin approves the account

---

## 3. Publisher Login

**Endpoint:** `POST /login`
**Authentication:** None (Public)
**Description:** Login with email and password to get JWT token

### Request Body
```json
{
  "email": "john@publisher.com",
  "password": "SecurePass123"
}
```

### Request Validation
- `email` - Required, valid email format
- `password` - Required, non-empty string

### Success Response (200)
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "63f7d8c3a4b2e1a9f8c3d4e5",
      "fullName": "John Smith",
      "email": "john@publisher.com",
      "publisherName": "Smith Publishing House",
      "phoneNumber": "+1-234-567-8900",
      "address": {
        "street": "123 Publishing Lane",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA"
      },
      "isEmailVerified": true,
      "isApproved": true,
      "isActive": true,
      "lastLogin": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### Error Responses

**401 Unauthorized** - Invalid credentials
```json
{
  "success": false,
  "message": "Invalid email or password."
}
```

**400 Bad Request** - Email not verified
```json
{
  "success": false,
  "message": "Please verify your email first. Check your inbox for the OTP."
}
```

**400 Bad Request** - Awaiting admin approval
```json
{
  "success": false,
  "message": "Your publisher account is awaiting admin approval."
}
```

**401 Unauthorized** - Account deactivated
```json
{
  "success": false,
  "message": "Your account is deactivated."
}
```

### cURL Example
```bash
curl -X POST http://localhost:5000/api/v1/auth/publisher/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@publisher.com",
    "password": "SecurePass123"
  }'
```

### Notes
- JWT token has 7-day expiry
- LastLogin timestamp is updated on successful login
- Account must be email-verified and admin-approved to login
- Password is case-sensitive
- Token must be included in all protected endpoint requests

---

## 4. Publisher Forgot Password (Send OTP)

**Endpoint:** `POST /forgot-password`
**Authentication:** None (Public)
**Description:** Initiate password reset process by sending OTP to email

### Request Body
```json
{
  "email": "john@publisher.com"
}
```

### Request Validation
- `email` - Required, valid email format

### Success Response (200)
```json
{
  "success": true,
  "message": "OTP sent to your email. Please check your inbox."
}
```

### Notes
- Response is same whether email exists or not (security measure)
- OTP is valid for 10 minutes
- Prevents email enumeration attacks
- Multiple requests overwrite previous OTP

### cURL Example
```bash
curl -X POST http://localhost:5000/api/v1/auth/publisher/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@publisher.com"
  }'
```

---

## 5. Verify Password Reset OTP

**Endpoint:** `POST /verify-reset-otp`
**Authentication:** None (Public)
**Description:** Verify OTP before allowing password reset

### Request Body
```json
{
  "email": "john@publisher.com",
  "otp": "123456"
}
```

### Request Validation
- `email` - Required, valid email format
- `otp` - Required, exactly 6 digits

### Success Response (200)
```json
{
  "success": true,
  "message": "OTP verified. You can now reset your password.",
  "data": {
    "verified": true
  }
}
```

### Error Responses

**404 Not Found** - Publisher not found
```json
{
  "success": false,
  "message": "Publisher not found."
}
```

**400 Bad Request** - OTP expired
```json
{
  "success": false,
  "message": "OTP expired. Please request password reset again."
}
```

**400 Bad Request** - Invalid OTP with attempts
```json
{
  "success": false,
  "message": "Invalid OTP. 3 attempts remaining."
}
```

### cURL Example
```bash
curl -X POST http://localhost:5000/api/v1/auth/publisher/verify-reset-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@publisher.com",
    "otp": "123456"
  }'
```

---

## 6. Reset Password

**Endpoint:** `POST /reset-password`
**Authentication:** None (Public)
**Description:** Set new password after OTP verification

### Request Body
```json
{
  "email": "john@publisher.com",
  "newPassword": "NewSecurePass456"
}
```

### Request Validation
- `email` - Required, valid email format
- `newPassword` - Required, minimum 6 characters

### Success Response (200)
```json
{
  "success": true,
  "message": "Password reset successfully. Please login with your new password."
}
```

### Error Responses

**404 Not Found** - Publisher not found
```json
{
  "success": false,
  "message": "Publisher not found."
}
```

### cURL Example
```bash
curl -X POST http://localhost:5000/api/v1/auth/publisher/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@publisher.com",
    "newPassword": "NewSecurePass456"
  }'
```

### Notes
- Must call verify-reset-otp endpoint first
- OTP is cleared after successful password reset
- Login required with new password after reset

---

## 7. Update Password (Protected)

**Endpoint:** `PUT /update-password`
**Authentication:** Required (JWT Bearer Token)
**Description:** Change password while authenticated

### Headers
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

### Request Body
```json
{
  "currentPassword": "SecurePass123",
  "newPassword": "NewSecurePass789"
}
```

### Request Validation
- `currentPassword` - Required, non-empty string
- `newPassword` - Required, minimum 6 characters

### Success Response (200)
```json
{
  "success": true,
  "message": "Password updated successfully."
}
```

### Error Responses

**404 Not Found** - Publisher not found
```json
{
  "success": false,
  "message": "Publisher not found."
}
```

**400 Bad Request** - Incorrect current password
```json
{
  "success": false,
  "message": "Current password is incorrect."
}
```

**401 Unauthorized** - Invalid token
```json
{
  "success": false,
  "message": "Unauthorized - Invalid or expired token"
}
```

### cURL Example
```bash
curl -X PUT http://localhost:5000/api/v1/auth/publisher/update-password \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "SecurePass123",
    "newPassword": "NewSecurePass789"
  }'
```

### Notes
- Must provide current password for verification
- New password cannot be same as current password
- Session is maintained after update

---

## 8. Update Profile (Protected)

**Endpoint:** `PUT /profile`
**Authentication:** Required (JWT Bearer Token)
**Description:** Update publisher profile information

### Headers
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

### Request Body (All fields optional)
```json
{
  "fullName": "John Smith Jr.",
  "publisherName": "Smith Publishing House Expanded",
  "phoneNumber": "+1-234-567-9999",
  "address": {
    "street": "456 New Publishing Avenue",
    "city": "Boston",
    "state": "MA",
    "zipCode": "02101",
    "country": "USA"
  }
}
```

### Request Validation
- `fullName` - Optional, minimum 2 characters if provided
- `publisherName` - Optional, minimum 2 characters if provided
- `phoneNumber` - Optional, valid phone format if provided
- `address` - Optional, can update individual fields or all

### Success Response (200)
```json
{
  "success": true,
  "message": "Profile updated successfully.",
  "data": {
    "user": {
      "_id": "63f7d8c3a4b2e1a9f8c3d4e5",
      "fullName": "John Smith Jr.",
      "email": "john@publisher.com",
      "publisherName": "Smith Publishing House Expanded",
      "phoneNumber": "+1-234-567-9999",
      "address": {
        "street": "456 New Publishing Avenue",
        "city": "Boston",
        "state": "MA",
        "zipCode": "02101",
        "country": "USA"
      },
      "isEmailVerified": true,
      "isApproved": true,
      "isActive": true,
      "lastLogin": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### Error Responses

**404 Not Found** - Publisher not found
```json
{
  "success": false,
  "message": "Publisher not found."
}
```

**401 Unauthorized** - Invalid token
```json
{
  "success": false,
  "message": "Unauthorized - Invalid or expired token"
}
```

### cURL Example
```bash
curl -X PUT http://localhost:5000/api/v1/auth/publisher/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "publisherName": "Smith Publishing House Expanded",
    "phoneNumber": "+1-234-567-9999"
  }'
```

### Notes
- Email cannot be updated through this endpoint
- Partial updates allowed (only send fields to update)
- isApproved flag cannot be changed by publisher
- All updated fields are validated

---

## 9. Get Publisher Profile (Protected)

**Endpoint:** `GET /profile`
**Authentication:** Required (JWT Bearer Token)
**Description:** Retrieve authenticated publisher's profile information

### Headers
```
Authorization: Bearer <your_jwt_token>
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "63f7d8c3a4b2e1a9f8c3d4e5",
      "fullName": "John Smith",
      "email": "john@publisher.com",
      "publisherName": "Smith Publishing House",
      "phoneNumber": "+1-234-567-8900",
      "address": {
        "street": "123 Publishing Lane",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA"
      },
      "isEmailVerified": true,
      "isApproved": true,
      "isActive": true,
      "lastLogin": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-10T14:20:30.000Z"
    }
  }
}
```

### Error Responses

**404 Not Found** - Publisher not found
```json
{
  "success": false,
  "message": "Publisher not found."
}
```

**401 Unauthorized** - Invalid token
```json
{
  "success": false,
  "message": "Unauthorized - Invalid or expired token"
}
```

### cURL Example
```bash
curl -X GET http://localhost:5000/api/v1/auth/publisher/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Notes
- Returns complete publisher information
- Email is read-only
- All dates in ISO 8601 format
- No password hash included in response

---

## Error Codes Reference

| Status | Code | Meaning |
|--------|------|---------|
| 200 | OK | Request successful |
| 201 | CREATED | Resource created successfully |
| 400 | BAD_REQUEST | Invalid request parameters or validation failed |
| 401 | UNAUTHORIZED | Authentication failed or token invalid |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Email already exists |
| 500 | INTERNAL_SERVER_ERROR | Server error or email service failure |

---

## Authentication Flow

### Sign Up Flow
1. POST `/signup` - Provide publisher details
2. Receive OTP email
3. POST `/verify-signup` - Verify OTP
4. Wait for admin approval
5. POST `/login` - Login (after admin approves)

### Login with Existing Account
1. POST `/login` - Provide email and password
2. Receive JWT token

### Password Reset Flow
1. POST `/forgot-password` - Request password reset
2. Receive OTP email
3. POST `/verify-reset-otp` - Verify OTP
4. POST `/reset-password` - Set new password
5. POST `/login` - Login with new password

---

## Important Notes

### JWT Token
- **Validity:** 7 days from generation
- **Format:** Bearer token in Authorization header
- **Inclusion:** Required for all protected endpoints
- **Usage:** `Authorization: Bearer <token>`

### OTP Details
- **Format:** 6 digits
- **Validity:** 10 minutes
- **Max Attempts:** 5 (account deletion after exceeding)
- **Auto-expires:** After 10 minutes

### Account Status
- **isEmailVerified:** Set after OTP verification
- **isApproved:** Set by admin (required for login)
- **isActive:** Toggled by admin, defaults to true

### Security
- Passwords hashed with bcryptjs
- OTP rate-limited to 5 attempts
- Email-based verification mandatory
- Admin approval required for full access
- No sensitive data in API responses (no password hashes)

---

## Testing Checklist

- [ ] Signup with valid publisher info
- [ ] Verify signup OTP
- [ ] Attempt login before admin approval
- [ ] Admin approval (simulated in tests)
- [ ] Login after admin approval
- [ ] Update password while authenticated
- [ ] Forgot password flow
- [ ] Verify reset OTP
- [ ] Reset password to new value
- [ ] Update profile with new info
- [ ] Get profile returns latest data
- [ ] Invalid OTP handling
- [ ] Expired OTP handling
- [ ] Duplicate email rejection
- [ ] Invalid token rejection
- [ ] Validation error responses
