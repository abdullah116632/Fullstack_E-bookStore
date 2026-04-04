# Quick Reference Guide

## 🚀 Quick Start

### Start Both Servers

**Terminal 1 (Backend)**:
```bash
cd backend && npm run dev
```
Expected: `Server running on http://localhost:5000`

**Terminal 2 (Frontend)**:
```bash
cd frontend && npm run dev
```
Expected: `> ready - started server on 0.0.0.0:3000`

**Open Browser**: `http://localhost:3000`

---

## 📁 Important Directories

```
frontend/
├── app/                   # Next.js pages & layout
│   ├── page.js           # Landing page (/)
│   ├── layout.js         # Root layout with Providers
│   └── providers.js      # Redux + Toast setup
├── components/
│   ├── common/           # Reusable components
│   │   ├── Navbar.js
│   │   ├── Footer.js
│   │   ├── Button.js
│   │   ├── Input.js
│   │   └── Drawer.js
│   ├── auth/             # Auth forms
│   │   ├── AuthDrawer.js # Master auth component
│   │   ├── LoginForm.js
│   │   ├── SignupForm.js
│   │   └── OTPForm.js
│   └── HeroSection.js
├── store/
│   ├── index.js          # Redux store config
│   └── slices/
│       └── authSlice.js  # Auth state & thunks
├── services/
│   ├── api.js            # Axios with interceptors
│   └── authService.js    # API functions
└── constants/
    └── api.js            # Endpoints, messages

backend/
├── routes/
│   └── auth.js           # All auth endpoints
├── models/
│   ├── Reader.js
│   ├── Publisher.js
│   └── Admin.js
├── controllers/
│   └── auth.js           # Route logic
├── middleware/
│   └── auth.js           # JWT verification
└── .env                  # Environment variables
```

---

## 🔑 Key Files Cheat Sheet

### Frontend

| File | Purpose | Key Content |
|------|---------|-------------|
| `app/page.js` | Landing page | Navbar, Hero, Footer, AuthDrawer |
| `components/auth/AuthDrawer.js` | Auth master | Manages login/signup/otp forms |
| `store/slices/authSlice.js` | Redux auth | State, actions, thunks (15 total) |
| `services/authService.js` | API calls | 18 endpoints for 3 user types |
| `constants/api.js` | Config | Base URL, endpoints, messages |
| `.env.local` | Environment | API URL configuration |

### Backend

| File | Purpose |
|------|---------|
| `routes/auth.js` | All auth routes |
| `controllers/auth.js` | Logic for all endpoints |
| `models/*.js` | User schemas |
| `middleware/auth.js` | JWT verification |
| `.env` | Database, email, JWT config |

---

## 🔐 Auth Endpoints

### Reader
```
POST   /auth/reader/signup              Create account
POST   /auth/reader/verify-signup       Verify OTP
POST   /auth/reader/login               Login
POST   /auth/reader/forgot-password     Request reset
POST   /auth/reader/verify-reset-otp    Verify reset OTP
POST   /auth/reader/reset-password      Set new password
GET    /auth/reader/profile             Get profile (auth required)
```

### Publisher
```
Same as Reader + these checks admin approval
```

### Admin
```
POST   /auth/admin/login                Admin login only
```

---

## 📦 Redux Usage Cheat Sheet

### Import Redux
```javascript
import { useSelector, useDispatch } from 'react-redux';
import { readerLogin, logout } from '@/store/slices/authSlice';
```

### Get State
```javascript
const { user, isLoading, error, message } = useSelector(state => state.auth);
```

### Dispatch Action
```javascript
const dispatch = useDispatch();

// Async thunk
await dispatch(readerLogin(credentials)).unwrap();

// Sync action
dispatch(logout());
dispatch(clearError());
```

### Handle Thunk Result
```javascript
try {
  const result = await dispatch(readerLogin(credentials)).unwrap();
  // Success
  toast.success('Login successful!');
} catch (error) {
  // Error
  toast.error(error);
}
```

---

## 🎨 Component Usage Cheat Sheet

### Button
```jsx
<Button 
  variant="primary|secondary|outline|danger"
  size="sm|md|lg"
  isLoading={loading}
  onClick={handleClick}
>
  Click Me
</Button>
```

### Input
```jsx
<Input 
  label="Email"
  type="email"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  error={errorMessage}
  required
/>
```

### Drawer
```jsx
<Drawer 
  isOpen={open}
  onClose={() => setOpen(false)}
  title="Drawer Title"
>
  {children}
</Drawer>
```

### AuthDrawer (Use in page.js)
```jsx
<AuthDrawer 
  isOpen={showAuth}
  onClose={() => setShowAuth(false)}
/>
```

---

## 🔗 API Call Pattern

### Service
```javascript
// services/authService.js
export const readerAuthService = {
  signup: (data) => api.post('/auth/reader/signup', data),
  login: (data) => api.post('/auth/reader/login', data),
  // ...
};
```

### Redux Thunk
```javascript
// store/slices/authSlice.js
export const readerLogin = createAsyncThunk(
  'auth/readerLogin',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await readerAuthService.login(credentials);
      localStorage.setItem('authToken', response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);
```

### Component
```javascript
const dispatch = useDispatch();
const { isLoading } = useSelector(state => state.auth);

const handleSubmit = async (credentials) => {
  try {
    await dispatch(readerLogin(credentials)).unwrap();
  } catch (error) {
    toast.error(error);
  }
};
```

---

## 🎯 Form Handling Pattern

### State Management
```javascript
const [formData, setFormData] = useState({
  email: '',
  password: ''
});

const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });
};
```

### Validation
```javascript
const errors = {};
if (!formData.email) errors.email = 'Email required';
if (!formData.password) errors.password = 'Password required';
setErrors(errors);
```

### Submit
```javascript
const handleSubmit = (e) => {
  e.preventDefault();
  if (Object.keys(errors).length === 0) {
    dispatch(submitAction(formData));
  }
};
```

---

## 🚨 Error Handling

### In Redux Thunk
```javascript
export const someAction = createAsyncThunk(
  'slice/action',
  async (data, { rejectWithValue }) => {
    try {
      const response = await service.call(data);
      return response.data;
    } catch (error) {
      // Return error message
      return rejectWithValue(
        error.response?.data?.message || 'Network error'
      );
    }
  }
);
```

### In Reducer
```javascript
.addCase(someAction.rejected, (state, action) => {
  state.error = action.payload;
  state.isLoading = false;
})
```

### In Component
```javascript
const { error } = useSelector(state => state.auth);

if (error) {
  toast.error(error);
}

return (
  <>
    {error && <Alert type="error">{error}</Alert>}
  </>
);
```

---

## 🔐 Authentication Flow

### Frontend
```
Login Form → Enter Credentials → Validate → 
dispatch(readerLogin) → Redux Thunk → 
API Call → Save Token → Update Redux State → 
Close Drawer → Show Navbar with User Info
```

### Token Management
```javascript
// Set token
localStorage.setItem('authToken', token);

// Get token
const token = localStorage.getItem('authToken');

// Clear token (on logout)
localStorage.removeItem('authToken');

// Axios adds it automatically
// via api.js interceptor
```

---

## 🎬 Toast Notifications

```javascript
import toast from 'react-hot-toast';

// Success
toast.success('User created successfully!');

// Error
toast.error('Something went wrong');

// Loading
toast.loading('Processing...');

// Custom duration
toast.success('Message', { duration: 5000 });

// Dismiss all
toast.dismiss();
```

---

## 🛠️ Common Terminal Commands

### Frontend
```bash
cd frontend

# Install packages
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint & format
npm run lint

# Check for unused packages
npm audit
```

### Backend
```bash
cd backend

# Install packages
npm install

# Start dev server
npm run dev

# Start production server
npm run start

# Check logs
npm run logs
```

---

## 📝 Form Data Structures

### Reader Sign-Up
```javascript
{
  fullName: "John Doe",
  email: "john@example.com",
  password: "SecurePass123"
}
```

### Publisher Sign-Up (Extended)
```javascript
{
  fullName: "Jane Doe",
  email: "jane@example.com",
  password: "SecurePass123",
  publisherName: "Jane's Publishing",
  phoneNumber: "+1234567890",
  address: {
    street: "123 Street",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "USA"
  }
}
```

### OTP Verification
```javascript
{
  email: "user@example.com",
  otp: "123456"
}
```

### Login
```javascript
{
  email: "user@example.com",
  password: "SecurePass123"
}
```

---

## 🔍 Debugging Tips

### Check Redux State
```javascript
// In browser console
store.getState().auth
```

### Check localStorage
```javascript
// In browser console
localStorage.getItem('authToken')
```

### Check API Response
```javascript
// Network tab → Click request → Response tab
{
  success: true,
  message: "...",
  data: { /* response data */ }
}
```

### Enable Debug Logging
```javascript
// In component
console.log('User:', user);
console.log('Loading:', isLoading);
console.log('Error:', error);
```

---

## 📋 Checklist: Adding New Feature

- [ ] Create backend API endpoint
- [ ] Test API with Postman/cURL
- [ ] Create service function (`/services/newService.js`)
- [ ] Create Redux slice (`/store/slices/newSlice.js`)
- [ ] Create UI components (`/components/new/...`)
- [ ] Test in browser
- [ ] Add error handling
- [ ] Add loading states
- [ ] Add toast notifications
- [ ] Test on mobile
- [ ] Test form validation

---

## 🚀 Deployment Checklist

- [ ] Remove console.logs
- [ ] Run `npm audit fix`
- [ ] Test all features
- [ ] Update .env variables
- [ ] Build frontend: `npm run build`
- [ ] Test production build
- [ ] Deploy to server
- [ ] Test on production URL
- [ ] Monitor logs for errors

---

## 📚 Documentation Files

| File | Content |
|------|---------|
| `FRONTEND_GUIDE.md` | Complete frontend guide |
| `INTEGRATION_GUIDE.md` | Backend-frontend integration |
| `DEVELOPMENT_WORKFLOW.md` | Architecture & workflow |
| `PROJECT_STRUCTURE.md` | Folder organization |
| `QUICK_REFERENCE.md` | This file! |

---

## 🎓 Learning Resources

### Redux Toolkit Docs
https://redux-toolkit.js.org/

### Next.js Docs
https://nextjs.org/docs

### Tailwind CSS Docs
https://tailwindcss.com/docs

### Axios Docs
https://axios-http.com/

### Framer Motion
https://www.framer.com/motion/

---

## 💡 Pro Tips

1. **Always test on mobile** - Use Chrome DevTools device toolbar
2. **Use Redux DevTools** - Browser extension for time-travel debugging
3. **Check console** - Errors often show in browser console
4. **Clear cache** - If styles don't update: `rm -rf frontend/.next`
5. **Restart servers** - If something behaves oddly, restart both servers
6. **Check .env** - If API calls fail, verify .env.local has correct URL
7. **Use Postman** - Test backend APIs before frontend integration
8. **Keep forms simple** - Validate on both client & server
9. **Toast for feedback** - Always show success/error messages
10. **Mobile first** - Design for mobile, scale up

---

## ❓ FAQ

**Q: How do I add a new thunk?**
A: See Pattern in Development Workflow Guide

**Q: How do I change the API URL?**
A: Edit `.env.local` → `NEXT_PUBLIC_API_URL=`

**Q: How do I test the backend alone?**
A: Use Postman or cURL to hit endpoints directly

**Q: Why is my token always expiring?**
A: 7-day expiry is intentional. User must login again after 7 days.

**Q: Can I use useState instead of Redux?**
A: For simple local state, yes. Use Redux for shared app state.

**Q: How do I add a new user type?**
A: Update backend schema, create service functions, add Redux thunks

---

## 🆘 Help

1. Check documentation files
2. Look at existing code patterns
3. Check browser console for errors
4. Check backend logs in terminal
5. Check Redux DevTools
6. Check network tab in DevTools

---

**Last Updated**: Today  
**Status**: ✅ Complete  
**Next Phase**: Book Catalog System

Happy coding! 🚀
