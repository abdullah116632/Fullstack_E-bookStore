# Reader Authentication API Documentation

## Base URL
```
http://localhost:5000/api/v1/auth
```

## Endpoints

### 1. Reader Signup (Send OTP)
**POST** `/reader/signup`

**Description:** Register a new reader account. Sends OTP to the provided email.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "OTP sent to your email. Please verify to complete signup.",
  "data": {
    "email": "john@example.com",
    "message": "Check your email for the 6-digit OTP"
  }
}
```

**Validation Rules:**
- `fullName`: Required, minimum 2 characters
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters

---

### 2. Verify Reader Signup (Verify OTP)
**POST** `/reader/verify-signup`

**Description:** Verify the OTP sent during signup to complete email verification.

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully. Welcome!",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "email": "john@example.com",
      "isEmailVerified": true,
      "isActive": true,
      "createdAt": "2024-04-03T10:00:00Z",
      "updatedAt": "2024-04-03T10:05:00Z"
    }
  }
}
```

**Error Cases:**
- Invalid OTP: 400 Bad Request
- Expired OTP: 400 Bad Request
- Too many attempts: Reader account deleted, 400 Bad Request
- Email not found: 404 Not Found

---

### 3. Reader Login
**POST** `/reader/login`

**Description:** Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "email": "john@example.com",
      "isEmailVerified": true,
      "isActive": true,
      "lastLogin": "2024-04-03T10:10:00Z"
    }
  }
}
```

**Error Cases:**
- Invalid credentials: 401 Unauthorized
- Email not verified: 400 Bad Request
- Account deactivated: 401 Unauthorized

---

### 4. Forgot Password (Send Reset OTP)
**POST** `/reader/forgot-password`

**Description:** Request password reset. Sends OTP to registered email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP sent to your email. Please check your inbox."
}
```

**Note:** Always returns success for security (doesn't reveal if email exists)

---

### 5. Verify Reset OTP
**POST** `/reader/verify-reset-otp`

**Description:** Verify the OTP sent for password reset before setting new password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP verified. You can now reset your password.",
  "data": {
    "verified": true
  }
}
```

**Error Cases:**
- Invalid OTP: 400 Bad Request
- Expired OTP: 400 Bad Request
- Too many attempts: 400 Bad Request

---

### 6. Reset Password
**POST** `/reader/reset-password`

**Description:** Set a new password after OTP verification.

**Request Body:**
```json
{
  "email": "john@example.com",
  "newPassword": "newpassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully. Please login with your new password."
}
```

---

### 7. Update Password (Protected)
**PUT** `/reader/update-password`

**Description:** Change password for authenticated user.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request Body:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password updated successfully."
}
```

**Error Cases:**
- Invalid current password: 400 Bad Request
- User not found: 404 Not Found

---

### 8. Update Profile (Protected)
**PUT** `/reader/update-profile`

**Description:** Update reader profile (currently only fullName).

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request Body:**
```json
{
  "fullName": "Jane Doe"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully.",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "fullName": "Jane Doe",
      "email": "john@example.com",
      "isEmailVerified": true,
      "isActive": true,
      "updatedAt": "2024-04-03T10:15:00Z"
    }
  }
}
```

---

### 9. Get Reader Profile (Protected)
**GET** `/reader/profile`

**Description:** Get authenticated reader's profile information.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "email": "john@example.com",
      "isEmailVerified": true,
      "isActive": true,
      "lastLogin": "2024-04-03T10:10:00Z",
      "createdAt": "2024-04-03T10:00:00Z",
      "updatedAt": "2024-04-03T10:05:00Z"
    }
  }
}
```

---

## Authentication

Protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Token is obtained from successful login or signup verification. Default expiry: 7 days

## OTP Details

- **Length:** 6 digits
- **Expiry:** 10 minutes
- **Max Attempts:** 5 attempts before account/request is locked

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request (validation error, expired OTP, etc.) |
| 401 | Unauthorized (invalid credentials, missing token) |
| 404 | Not Found (user not found) |
| 409 | Conflict (email already registered) |
| 500 | Internal Server Error |

## Response Format

All responses follow this format:

**Success:**
```json
{
  "success": true,
  "message": "Success message",
  "data": { /* optional data */ }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message"
}
```

## Testing with Postman/cURL

### Example: Reader Signup
```bash
curl -X POST http://localhost:5000/api/v1/auth/reader/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Example: Verify Signup
```bash
curl -X POST http://localhost:5000/api/v1/auth/reader/verify-signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "123456"
  }'
```

### Example: Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/reader/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Example: Get Profile (Protected)
```bash
curl -X GET http://localhost:5000/api/v1/auth/reader/profile \
  -H "Authorization: Bearer <your_jwt_token>"
```

## Next Steps

The Reader authentication API is complete with:
- ✅ Signup with OTP verification via Resend
- ✅ Email verification
- ✅ Login with JWT tokens
- ✅ Password reset with OTP
- ✅ Change password (authenticated users)
- ✅ Profile management
- ✅ Security with rate limiting on OTP attempts

Ready to implement Publisher and Admin authentication!
