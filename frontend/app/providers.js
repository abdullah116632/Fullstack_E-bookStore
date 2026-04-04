'use client';

import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from '@/contexts/LanguageContext';
import AuthRestorer from '@/components/auth/AuthRestorer';
import store from '@/store';

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <LanguageProvider>
        <AuthRestorer />
        {children}
        <Toaster position="top-right" />
      </LanguageProvider>
    </Provider>
  );
}
