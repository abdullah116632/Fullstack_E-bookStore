# EBook Marketplace - Frontend

A modern, professional React/Next.js frontend for the E-book marketplace platform.

## 🚀 Features

- **Modern UI**: Clean and professional design with Tailwind CSS
- **Responsive Design**: Mobile-friendly interface that works on all devices
- **Authentication**: Separate auth flows for Readers, Publishers, and Admins
- **OTP Verification**: Email-based OTP verification for secure sign-up
- **State Management**: Redux Toolkit with Redux Thunk for API calls
- **Real-time Notifications**: Toast notifications for user feedback
- **Smooth Animations**: Framer Motion for beautiful UI transitions
- **Drawer Forms**: Elegant right-side drawers for auth forms

## 📁 Project Structure

```
frontend/
├── app/
│   ├── layout.js              # Root layout with providers
│   ├── page.js                # Landing page (home)
│   ├── globals.css            # Global styles
│   └── providers.js           # Redux + Toast providers
│
├── components/
│   ├── common/
│   │   ├── Navbar.js          # Navigation bar
│   │   ├── Footer.js          # Footer
│   │   ├── Button.js          # Reusable button component
│   │   ├── Input.js           # Reusable input component
│   │   └── Drawer.js          # Drawer component for modals
│   │
│   ├── auth/
│   │   ├── AuthDrawer.js      # Wrapper for all auth forms
│   │   ├── LoginForm.js       # Login form component
│   │   ├── SignupForm.js      # Sign-up form component
│   │   └── OTPForm.js         # OTP verification form
│   │
│   └── HeroSection.js         # Landing page hero section
│
├── store/
│   ├── index.js               # Redux store configuration
│   └── slices/
│       └── authSlice.js       # Auth state & thunks
│
├── services/
│   ├── api.js                 # Axios instance with interceptors
│   └── authService.js         # Auth API calls
│
├── constants/
│   └── api.js                 # API endpoints & constants
│
├── hooks/
│   └── (custom hooks)         # Reusable hooks
│
├── utils/
│   └── (utilities)            # Helper functions
│
├── .env.local                 # Environment variables
├── jsconfig.json              # Path aliases config
├── tailwind.config.mjs         # Tailwind CSS config
├── next.config.mjs            # Next.js config
├── package.json               # Dependencies
└── README.md                  # This file
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16.2.1
- **UI Library**: React 19.2.4
- **Styling**: Tailwind CSS 4
- **State Management**: Redux Toolkit + Redux Thunk
- **API Client**: Axios
- **Animations**: Framer Motion
- **Icons**: React Icons (All)
- **Notifications**: React Hot Toast
- **Code Quality**: ESLint

## 📦 Installation

1. **Navigate to frontend directory**:
```bash
cd frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
Create `.env.local` file with:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

4. **Start development server**:
```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

## 🔑 Key Components

### Authentication System

The frontend implements a complete authentication system:

1. **Reader Authentication**
   - Sign up with email
   - Email verification via OTP
   - Login and profile management

2. **Publisher Authentication**
   - Extended sign-up with business info
   - Address information collection
   - Email verification via OTP
   - Admin approval workflow

3. **Admin Authentication**
   - Direct login (pre-created accounts)
   - Password management

### Forms

All authentication forms open as:
- **Right-side drawers** for desktop
- **Full-screen modals** for mobile
- **Smooth animations** using Framer Motion
- **Real-time validation** with error messages
- **Loading states** for async operations

### Redux State Management

**Auth Slice** (`store/slices/authSlice.js`):
- `user`: Current user data
- `userType`: Type of user (reader/publisher/admin)
- `authToken`: JWT token
- `isAuthenticated`: Auth status
- `isLoading`: Loading state
- `error`: Error messages
- `signupEmail`: Email during signup flow

### API Integration

All API calls use:
- **Axios instance** with request/response interceptors
- **JWT token** automatically attached to protected routes
- **Error handling** with automatic logout on 401
- **Redux Thunk** for async operations

## 🎨 Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Custom colors**: Blue and Indigo gradients
- **Responsive**: Mobile-first approach
- **Dark mode ready**: Can be extended for dark theme

## 📱 Responsive Design

- **Mobile**: Full width with stacked layouts
- **Tablet**: Optimized 2-3 column layouts
- **Desktop**: Full multi-column layouts
- **All components** tested on various screen sizes

## 🚦 Getting Started

1. **Start backend** (if not running):
```bash
cd backend
npm run dev
```

2. **Start frontend**:
```bash
cd frontend
npm run dev
```

3. **Test authentication**:
   - Click "Sign Up" button
   - Select user type (Reader/Publisher)
   - Fill in details
   - Verify OTP (use any 6-digit code in development)
   - Login with credentials

## 🔐 Security Features

- JWT token storage in localStorage
- Automatic token attachment to API requests
- Token expiry handling (401 response logout)
- Password field masking
- Email validation
- Form validation before submission

## 📝 Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_APP_NAME=EBook Marketplace
NEXT_PUBLIC_APP_DESCRIPTION=Discover, read, and publish amazing books
```

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### For Vercel:
1. Push code to GitHub
2. Connect repository in Vercel
3. Set environment variables
4. Deploy

## 📚 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🎯 Next Steps

- [ ] **Book Browsing**: Browse and search books
- [ ] **Shopping Cart**: Add books to cart
- [ ] **Checkout**: Payment integration
- [ ] **My Library**: Manage purchased books
- [ ] **Publisher Dashboard**: Sell books
- [ ] **Admin Dashboard**: Manage system
- [ ] **User Profiles**: Edit profile info
- [ ] **Wishlist**: Save favorite books
- [ ] **Reviews & Ratings**: Rate books
- [ ] **Social Features**: Follow publishers

## 🤝 Contributing

1. Create feature branches
2. Follow naming conventions
3. Write clean, documented code
4. Submit pull requests

## 📄 License

Private - E-book Marketplace Project

## 🆘 Support

For issues or questions, contact the development team.

---

**Built with ❤️ for book lovers worldwide**
