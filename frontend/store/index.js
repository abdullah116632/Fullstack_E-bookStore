import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/readerLogin/fulfilled', 'auth/publisherLogin/fulfilled', 'auth/adminLogin/fulfilled'],
        ignoredPaths: ['auth.user'],
      },
    }),
});

export default store;
