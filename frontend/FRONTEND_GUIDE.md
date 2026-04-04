# Frontend Setup & Development Guide

## Quick Start

### 1. Prerequisites
- Node.js 18+ installed
- Backend server running on `http://localhost:5000`
- npm or yarn package manager

### 2. Installation

```bash
cd frontend
npm install
```

### 3. Configure Environment

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Architecture

### Folder Structure Explained

#### `/app`
- **layout.js**: Root layout wrapping entire app with Redux Provider and Toast
- **page.js**: Landing page with Navbar, Hero, Footer, and Auth Drawer
- **globals.css**: Global Tailwind CSS imports
- **providers.js**: Redux Store + React Hot Toast configuration

#### `/components`
**common/** - Reusable components
- **Navbar.js**: Navigation with login/signup buttons, user profile, logout
- **Footer.js**: Company info, links, social media
- **Button.js**: Primary, secondary, outline, danger variants
- **Input.js**: Form input with validation errors
- **Drawer.js**: Right-side modal with Framer Motion animations

**auth/** - Authentication components
- **AuthDrawer.js**: Master wrapper coordinating all auth forms
- **LoginForm.js**: Email + password login (Reader, Publisher, Admin)
- **SignupForm.js**: Sign-up form with optional extended fields for publishers
- **OTPForm.js**: 6-digit OTP verification with resend timer

**HeroSection.js** - Landing page hero with features, stats, and CTAs

#### `/store`
Redux state management
- **index.js**: Store configuration
- **slices/authSlice.js**: Auth state, actions, reducers, async thunks

#### `/services`
API communication layer
- **api.js**: Axios instance with JWT interceptor, error handling
- **authService.js**: All auth API endpoints for Reader, Publisher, Admin

#### `/constants`
- **api.js**: Base URL, endpoints, error/success messages, user types

#### `/hooks` (Empty - Ready for Custom Hooks)
Place for custom React hooks like useAuth, useFetch, etc.

#### `/utils` (Empty - Ready for Utilities)
Place for helper functions, validators, formatters, etc.

---

## Authentication Flow

### Reader Sign-Up Flow

```
1. User clicks "Sign Up"
   ↓
2. AuthDrawer opens with SignupForm
   ↓
3. User fills fullName, email, password
   ↓
4. Form validation + dispatch readerSignup()
   ↓
5. Backend responds with OTP sent message
   ↓
6. Form switches to OTPForm with email pre-filled
   ↓
7. User enters 6-digit OTP
   ↓
8. dispatch readerVerifySignup() sends OTP
   ↓
9. Backend confirms, auth token returned
   ↓
10. Token stored in localStorage
    ↓
11. Drawer closes, user is logged in
    ↓
12. Navbar shows user profile + logout button
```

### Reader Login Flow

```
1. User clicks "Login"
   ↓
2. AuthDrawer opens with LoginForm
   ↓
3. User fills email + password
   ↓
4. dispatch readerLogin() sends credentials
   ↓
5. Backend validates, returns token + user
   ↓
6. Token stored in localStorage
   ↓
7. Drawer closes, user logged in
   ↓
8. Navbar updated with profile
```

### Publisher Sign-Up Flow

```
1. Same as Reader UNTIL form selection
   ↓
2. SignupForm shows EXTENDED FIELDS:
   - publisherName
   - phoneNumber
   - address (street, city, state, zipCode, country)
   ↓
3. All other steps same as Reader
   ↓
4. After OTP verification, message shows:
   "Awaiting admin approval"
   ↓
5. Login will fail until admin approves
```

---

## Component Documentation

### Button.js

```jsx
<Button
  variant="primary|secondary|outline|danger"
  size="sm|md|lg"
  isLoading={boolean}
  disabled={boolean}
  onClick={handler}
>
  Click Me
</Button>
```

### Input.js

```jsx
<Input
  label="Field Label"
  type="text|email|password"
  value={value}
  onChange={handler}
  error={errorMessage}
  required={true}
  placeholder="Placeholder text"
/>
```

### Drawer.js

```jsx
<Drawer
  isOpen={boolean}
  onClose={handler}
  title="Drawer Title"
>
  {children}
</Drawer>
```

---

## Redux Store Structure

### State Shape

```javascript
{
  auth: {
    user: {
      _id: string,
      fullName: string,
      email: string,
      // ... other fields based on userType
    },
    userType: 'reader' | 'publisher' | 'admin',
    authToken: string,
    isLoading: boolean,
    error: string | null,
    isAuthenticated: boolean,
    signupEmail: string | null,
    message: string | null,
  }
}
```

### Available Actions

#### Thunks (Async)
- `readerSignup(data)`
- `readerVerifySignup(data)`
- `readerLogin(data)`
- `readerForgotPassword(data)`
- `readerVerifyResetOTP(data)`
- `readerResetPassword(data)`
- `publisherSignup(data)`
- `publisherVerifySignup(data)`
- `publisherLogin(data)`
- `publisherForgotPassword(data)`
- `adminLogin(data)`

#### Reducers (Sync)
- `logout()` - Clear all auth data
- `clearError()` - Clear error message
- `clearMessage()` - Clear success message
- `setSignupEmail(email)` - Set email during signup

### Using Redux in Components

```javascript
import { useSelector, useDispatch } from 'react-redux';
import { readerLogin, logout } from '@/store/slices/authSlice';

export default function MyComponent() {
  const { user, isLoading, error } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const handleLogin = async (credentials) => {
    try {
      await dispatch(readerLogin(credentials)).unwrap();
      // Success
    } catch (err) {
      // Error handled
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div>
      {user && <p>Hello, {user.fullName}</p>}
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

---

## API Service Usage

### Direct API Calls

```javascript
import { readerAuthService } from '@/services/authService';

// Sign up
const response = await readerAuthService.signup({
  fullName: 'John Doe',
  email: 'john@example.com',
  password: 'SecurePass123'
});

// Login
const response = await readerAuthService.login({
  email: 'john@example.com',
  password: 'SecurePass123'
});

// Verify OTP
const response = await readerAuthService.verifySignup({
  email: 'john@example.com',
  otp: '123456'
});

// Get Profile
const response = await readerAuthService.getProfile();

// Update Profile
const response = await readerAuthService.updateProfile({
  fullName: 'John Doe Jr.'
});
```

---

## Form Validation

### Built-in Validations

All forms validate:
- ✅ Required fields
- ✅ Email format
- ✅ Password length (min 6)
- ✅ Password confirmation match
- ✅ Publisher-specific fields
- ✅ Phone number format
- ✅ Address completeness

### Error Display

Errors appear below each field:
```
┌─────────────────────┐
│ Email               │
├─────────────────────┤
│ Invalid email       │ <- Error message
└─────────────────────┘
```

---

## Styling with Tailwind

### Color Scheme

- **Primary**: Blue (`bg-blue-600`, `text-blue-600`)
- **Secondary**: Gray (`bg-gray-200`, `text-gray-600`)
- **Accent**: Indigo (`from-indigo-600`)
- **Danger**: Red (`bg-red-600`)
- **Success**: Green (not yet used)

### Responsive Classes

- `sm:` - Small screens (640px+)
- `md:` - Medium screens (768px+)
- `lg:` - Large screens (1024px+)
- `xl:` - Extra large (1280px+)

Example:
```jsx
<div className="flex flex-col md:flex-row gap-4">
  {/* Column on mobile, row on medium+ */}
</div>
```

---

## Animations with Framer Motion

### Used Animations

- **Drawer**: Slide in from right, fade backdrop
- **Forms**: Fade & slide up on mount
- **Buttons**: Hover effects
- **Hero**: Stagger children with delays

---

## Debugging Tips

### Redux DevTools

Install Redux DevTools Extension for Chrome/Firefox to inspect state changes

### Network Debugging

1. Open DevTools → Network tab
2. Watch API calls to localhost:5000
3. Check request/response headers

### Console Logging

```javascript
// Log Redux action
dispatch(action).then(result => {
  console.log('Action result:', result);
});
```

---

## Mobile Testing

### Responsive Design Checklist

- [ ] Test on mobile (< 640px)
- [ ] Test on tablet (640px - 1024px)
- [ ] Test on desktop (> 1024px)
- [ ] Check form inputs on mobile
- [ ] Verify drawer works on all sizes
- [ ] Test navbar responsiveness
- [ ] Check touch interactions

### Mobile Modes in Chrome DevTools

1. Press `F12` or right-click → Inspect
2. Press `Ctrl + Shift + M` (Windows) or `Cmd + Shift + M` (Mac)
3. Select device preset or custom size

---

## Performance Optimization

### Current Optimizations

- ✅ Client-side form validation (no unnecessary API calls)
- ✅ Redux for efficient state management
- ✅ Lazy loading components with Next.js
- ✅ Image optimization (when used)
- ✅ CSS bundling with Tailwind

### Future Optimizations

- [ ] Code splitting
- [ ] Image compression
- [ ] Caching strategies
- [ ] Service workers

---

## Security Practices

### Implemented

- ✅ JWT stored in localStorage
- ✅ Token auto-attached to requests
- ✅ Automatic logout on 401
- ✅ Password field masking
- ✅ Form validation
- ✅ Error messages don't leak sensitive info

### Best Practices

- Never log sensitive data
- Use HTTPS in production
- Validate on both client & server
- Implement refresh token rotation
- Clear tokens on logout

---

## Troubleshooting

### "API request fails with CORS error"

**Solution**: Ensure backend is running with CORS enabled:
```javascript
// Backend server.js should have:
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
```

### "Token not being attached to requests"

**Solution**: Check `localStorage`:
```javascript
// In browser console:
console.log(localStorage.getItem('authToken'));
```

### "Form not submitting"

**Solution**: Check browser console for validation errors and Redux state:
```javascript
// In browser console:
const state = store.getState();
console.log(state.auth);
```

### "Drawer not closing after success"

**Solution**: Ensure `onSuccess` callback is called to close drawer.

---

## Next Steps for Development

1. **Create Dashboard Pages**
   - `/app/dashboard/reader/page.js`
   - `/app/dashboard/publisher/page.js`
   - `/app/dashboard/admin/page.js`

2. **Add Protected Routes**
   - Create middleware to check auth
   - Redirect unauthenticated users

3. **Implement Book Features**
   - Browse books
   - Search & filter
   - Add to cart/wishlist

4. **Add User Profile Management**
   - Edit profile page
   - Change password
   - Account settings

5. **Implement Payment Flow**
   - Shopping cart
   - Checkout
   - Order history

---

For questions or issues, refer to the documentation or contact the development team.

**Happy coding! 🚀**
