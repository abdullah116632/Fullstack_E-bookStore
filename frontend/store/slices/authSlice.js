import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { readerAuthService, publisherAuthService, adminAuthService } from '@/services/authService';

// ==================== READER AUTH THUNKS ====================

export const readerSignup = createAsyncThunk(
  'auth/readerSignup',
  async (data, { rejectWithValue }) => {
    try {
      const response = await readerAuthService.signup(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Signup failed' });
    }
  }
);

export const readerVerifySignup = createAsyncThunk(
  'auth/readerVerifySignup',
  async (data, { rejectWithValue }) => {
    try {
      const response = await readerAuthService.verifySignup(data);
      if (response.data?.data?.token) {
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        localStorage.setItem('userType', 'reader');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Verification failed' });
    }
  }
);

export const readerLogin = createAsyncThunk(
  'auth/readerLogin',
  async (data, { rejectWithValue }) => {
    try {
      const response = await readerAuthService.login(data);
      if (response.data?.data?.token) {
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        localStorage.setItem('userType', 'reader');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Login failed' });
    }
  }
);

export const readerForgotPassword = createAsyncThunk(
  'auth/readerForgotPassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await readerAuthService.forgotPassword(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Request failed' });
    }
  }
);

export const readerVerifyResetOTP = createAsyncThunk(
  'auth/readerVerifyResetOTP',
  async (data, { rejectWithValue }) => {
    try {
      const response = await readerAuthService.verifyResetOTP(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Verification failed' });
    }
  }
);

export const readerResetPassword = createAsyncThunk(
  'auth/readerResetPassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await readerAuthService.resetPassword(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Reset failed' });
    }
  }
);

// ==================== PUBLISHER AUTH THUNKS ====================

export const publisherSignup = createAsyncThunk(
  'auth/publisherSignup',
  async (data, { rejectWithValue }) => {
    try {
      const response = await publisherAuthService.signup(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Signup failed' });
    }
  }
);

export const publisherVerifySignup = createAsyncThunk(
  'auth/publisherVerifySignup',
  async (data, { rejectWithValue }) => {
    try {
      const response = await publisherAuthService.verifySignup(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Verification failed' });
    }
  }
);

export const publisherLogin = createAsyncThunk(
  'auth/publisherLogin',
  async (data, { rejectWithValue }) => {
    try {
      const response = await publisherAuthService.login(data);
      if (response.data?.data?.token) {
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        localStorage.setItem('userType', 'publisher');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Login failed' });
    }
  }
);

export const publisherForgotPassword = createAsyncThunk(
  'auth/publisherForgotPassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await publisherAuthService.forgotPassword(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Request failed' });
    }
  }
);

// ==================== ADMIN AUTH THUNKS ====================

export const adminLogin = createAsyncThunk(
  'auth/adminLogin',
  async (data, { rejectWithValue }) => {
    try {
      const response = await adminAuthService.login(data);
      if (response.data?.data?.token) {
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        localStorage.setItem('userType', 'admin');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Login failed' });
    }
  }
);

// ==================== INITIAL STATE ====================

const initialState = {
  user: null,
  userType: null,
  authToken: null,
  isLoading: false,
  error: null,
  signupEmail: null, // Store email during signup flow
  isAuthenticated: false,
  message: null,
};

// ==================== AUTH SLICE ====================

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.userType = null;
      state.authToken = null;
      state.isAuthenticated = false;
      state.signupEmail = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userType');
    },
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    setSignupEmail: (state, action) => {
      state.signupEmail = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Reader Signup
    builder
      .addCase(readerSignup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(readerSignup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message;
        state.signupEmail = action.payload.data.email;
      })
      .addCase(readerSignup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Signup failed';
      });

    // Reader Verify Signup
    builder
      .addCase(readerVerifySignup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(readerVerifySignup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data.user;
        state.userType = 'reader';
        state.authToken = action.payload.data.token;
        state.message = action.payload.message;
        state.signupEmail = null;
      })
      .addCase(readerVerifySignup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Verification failed';
      });

    // Reader Login
    builder
      .addCase(readerLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(readerLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data.user;
        state.userType = 'reader';
        state.authToken = action.payload.data.token;
        state.message = action.payload.message;
      })
      .addCase(readerLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Login failed';
      });

    // Reader Forgot Password
    builder
      .addCase(readerForgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(readerForgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message;
      })
      .addCase(readerForgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Request failed';
      });

    // Publisher Signup
    builder
      .addCase(publisherSignup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(publisherSignup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message;
        state.signupEmail = action.payload.data.email;
      })
      .addCase(publisherSignup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Signup failed';
      });

    // Publisher Verify Signup
    builder
      .addCase(publisherVerifySignup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(publisherVerifySignup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message;
        state.signupEmail = null;
      })
      .addCase(publisherVerifySignup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Verification failed';
      });

    // Publisher Login
    builder
      .addCase(publisherLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(publisherLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data.user;
        state.userType = 'publisher';
        state.authToken = action.payload.data.token;
        state.message = action.payload.message;
      })
      .addCase(publisherLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Login failed';
      });

    // Admin Login
    builder
      .addCase(adminLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data.user;
        state.userType = 'admin';
        state.authToken = action.payload.data.token;
        state.message = action.payload.message;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Login failed';
      });
  },
});

export const { logout, clearError, clearMessage, setSignupEmail } = authSlice.actions;
export default authSlice.reducer;
