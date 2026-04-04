# Admin Authentication API Documentation

## Overview
Admin authentication and profile management API endpoints. Admin accounts are pre-created by system administrators. No signup flow exists - only login and password management.

**Base URL:** `/api/v1/auth/admin`
**Authentication:** JWT Bearer Token (returned after login)

---

## 1. Admin Login

**Endpoint:** `POST /login`
**Authentication:** None (Public)
**Description:** Login admin with email and password to get JWT token

### Request Body
```json
{
  "email": "admin@ebook.com",
  "password": "AdminSecurePass123"
}
```

### Request Validation
- `email` - Required, valid email format
- `password` - Required, non-empty string

### Success Response (200)
```json
{
  "success": true,
  "message": "Admin login successful.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "63f7d8c3a4b2e1a9f8c3d4e6",
      "fullName": "Admin User",
      "email": "admin@ebook.com",
      "phoneNumber": "+1-234-567-0000",
      "isEmailVerified": true,
      "isActive": true,
      "lastLogin": "2024-01-15T10:35:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
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

**401 Unauthorized** - Account deactivated
```json
{
  "success": false,
  "message": "Your admin account is deactivated."
}
```

### cURL Example
```bash
curl -X POST http://localhost:5000/api/v1/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ebook.com",
    "password": "AdminSecurePass123"
  }'
```

### Notes
- Admin accounts must be pre-created in database with initial password
- Email is automatically verified for admin accounts
- JWT token has 7-day expiry
- LastLogin timestamp is updated on successful login
- Password is case-sensitive

---

## 2. Admin Forgot Password (Send OTP)

**Endpoint:** `POST /forgot-password`
**Authentication:** None (Public)
**Description:** Initiate admin password reset process by sending OTP to email

### Request Body
```json
{
  "email": "admin@ebook.com"
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
curl -X POST http://localhost:5000/api/v1/auth/admin/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ebook.com"
  }'
```

---

## 3. Verify Admin Password Reset OTP

**Endpoint:** `POST /verify-reset-otp`
**Authentication:** None (Public)
**Description:** Verify OTP before allowing password reset

### Request Body
```json
{
  "email": "admin@ebook.com",
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

**404 Not Found** - Admin not found
```json
{
  "success": false,
  "message": "Admin not found."
}
```

**400 Bad Request** - OTP not requested
```json
{
  "success": false,
  "message": "OTP not found. Please request password reset again."
}
```

**400 Bad Request** - OTP expired
```json
{
  "success": false,
  "message": "OTP expired. Please request password reset again."
}
```

**400 Bad Request** - Invalid OTP with attempts remaining
```json
{
  "success": false,
  "message": "Invalid OTP. 4 attempts remaining."
}
```

**400 Bad Request** - Too many OTP attempts
```json
{
  "success": false,
  "message": "Too many OTP attempts. Please try again later."
}
```

### cURL Example
```bash
curl -X POST http://localhost:5000/api/v1/auth/admin/verify-reset-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ebook.com",
    "otp": "123456"
  }'
```

### Notes
- OTP must be verified within 10 minutes
- Maximum 5 verification attempts allowed
- Exceeding attempts clears the OTP
- Must call forgot-password first to request OTP

---

## 4. Admin Reset Password

**Endpoint:** `POST /reset-password`
**Authentication:** None (Public)
**Description:** Set new password after OTP verification

### Request Body
```json
{
  "email": "admin@ebook.com",
  "newPassword": "NewAdminPass456"
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

**404 Not Found** - Admin not found
```json
{
  "success": false,
  "message": "Admin not found."
}
```

### cURL Example
```bash
curl -X POST http://localhost:5000/api/v1/auth/admin/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ebook.com",
    "newPassword": "NewAdminPass456"
  }'
```

### Notes
- Must call verify-reset-otp endpoint first
- OTP is cleared after successful reset
- Login required with new password

---

## 5. Admin Update Password (Protected)

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
  "currentPassword": "AdminSecurePass123",
  "newPassword": "NewAdminSecurePass789"
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

**404 Not Found** - Admin not found
```json
{
  "success": false,
  "message": "Admin not found."
}
```

**400 Bad Request** - Incorrect current password
```json
{
  "success": false,
  "message": "Current password is incorrect."
}
```

**401 Unauthorized** - Invalid or expired token
```json
{
  "success": false,
  "message": "Unauthorized - Invalid or expired token"
}
```

### cURL Example
```bash
curl -X PUT http://localhost:5000/api/v1/auth/admin/update-password \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "AdminSecurePass123",
    "newPassword": "NewAdminSecurePass789"
  }'
```

### Notes
- Requires current password for verification
- New password must be different from current password
- Session is maintained after update

---

## 6. Get Admin Profile (Protected)

**Endpoint:** `GET /profile`
**Authentication:** Required (JWT Bearer Token)
**Description:** Retrieve authenticated admin's profile information

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
      "_id": "63f7d8c3a4b2e1a9f8c3d4e6",
      "fullName": "Admin User",
      "email": "admin@ebook.com",
      "phoneNumber": "+1-234-567-0000",
      "isEmailVerified": true,
      "isActive": true,
      "lastLogin": "2024-01-15T10:35:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Error Responses

**404 Not Found** - Admin not found
```json
{
  "success": false,
  "message": "Admin not found."
}
```

**401 Unauthorized** - Invalid or expired token
```json
{
  "success": false,
  "message": "Unauthorized - Invalid or expired token"
}
```

### cURL Example
```bash
curl -X GET http://localhost:5000/api/v1/auth/admin/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Notes
- Returns complete admin profile information
- Email and phone are read-only
- All dates in ISO 8601 format
- No password hash included in response
- isEmailVerified is always true for admin accounts

---

## Error Codes Reference

| Status | Code | Meaning |
|--------|------|---------|
| 200 | OK | Request successful |
| 400 | BAD_REQUEST | Invalid request parameters or validation failed |
| 401 | UNAUTHORIZED | Authentication failed or token invalid |
| 404 | NOT_FOUND | Resource not found |
| 500 | INTERNAL_SERVER_ERROR | Server error or email service failure |

---

## Authentication Flow

### Admin Login
1. POST `/login` - Provide email and password
2. Receive JWT token on success

### Password Reset Flow
1. POST `/forgot-password` - Request OTP via email
2. Receive OTP in email (10-minute validity)
3. POST `/verify-reset-otp` - Verify OTP
4. POST `/reset-password` - Set new password
5. POST `/login` - Login with new password

### Password Update (Authenticated)
1. User already logged in with valid JWT token
2. PUT `/update-password` - Provide current and new password
3. Password updated immediately

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
- **Max Attempts:** 5
- **Auto-expires:** After 10 minutes or 5 failed attempts

### Account Creation
- Admin accounts must be created by super-admin or database direct insertion
- Email is pre-verified (no OTP verification step on login)
- isActive defaults to true
- isEmailVerified is always true

### Database Setup for Admin
```javascript
// Example: Create admin account in database
const admin = new Admin({
  fullName: 'System Admin',
  email: 'admin@ebook.com',
  password: 'InitialAdminPassword123', // Will be hashed automatically
  phoneNumber: '+1-234-567-0000',
  isEmailVerified: true, // Pre-verified
  isActive: true
});
await admin.save();
```

### Security Features
- Passwords hashed with bcryptjs
- OTP rate-limited to 5 attempts
- Email-based password reset verification
- No sensitive data in API responses
- JWT expiry prevents indefinite access
- LastLogin tracking for audit trail

---

## Use Cases

### 1. First-Time Admin Login
- Receive initial password from system admin
- POST `/login` with email and initial password
- Receive JWT token

### 2. Forgot Password
- POST `/forgot-password` to request OTP
- Check email for OTP
- POST `/verify-reset-otp` with OTP
- POST `/reset-password` with new password
- POST `/login` with new password

### 3. Regular Password Change
- Admin is authenticated with valid JWT
- PUT `/update-password` with current and new password
- No logout required, token remains valid

### 4. Account Management
- GET `/profile` to view account details
- Email and phoneNumber cannot be changed via API
- Contact super-admin to update email or phone

---

## Testing Endpoints

### Setup Test Admin Account
```bash
# Run this in your database:
# db.admins.insertOne({
#   fullName: "Test Admin",
#   email: "test@admin.com",
#   password: "hashed_password_from_bcryptjs",
#   phoneNumber: "+1-999-999-9999",
#   isEmailVerified: true,
#   isActive: true,
#   createdAt: new Date()
# })
```

### Quick Test Sequence
1. **Login:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@admin.com","password":"TestAdminPass123"}'
```

2. **Get Profile:**
```bash
curl -X GET http://localhost:5000/api/v1/auth/admin/profile \
  -H "Authorization: Bearer {token_from_login}"
```

3. **Update Password:**
```bash
curl -X PUT http://localhost:5000/api/v1/auth/admin/update-password \
  -H "Authorization: Bearer {token_from_login}" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword":"TestAdminPass123",
    "newPassword":"NewTestAdminPass456"
  }'
```

---

## Testing Checklist

- [ ] Admin login with correct credentials
- [ ] Admin login fails with incorrect password
- [ ] Admin login fails with deactivated account
- [ ] Get profile with valid token
- [ ] Get profile with invalid token
- [ ] Forgot password sends OTP email (check logs)
- [ ] Verify reset OTP with correct OTP
- [ ] Verify reset OTP fails with invalid OTP
- [ ] Reset password after verifying OTP
- [ ] Login with new password after reset
- [ ] Update password while authenticated
- [ ] Old password doesn't work after update
- [ ] New password works after update
- [ ] OTP expires after 10 minutes
- [ ] OTP attempt limit enforced (5 attempts)
- [ ] Multiple OTP requests overwrite previous
- [ ] Email never revealed in responses
- [ ] Password hash never in API responses
- [ ] JWT token expiration after 7 days
- [ ] Validation errors on invalid input
