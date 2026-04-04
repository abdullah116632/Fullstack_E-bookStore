'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { restoreAuthFromStorage } from '@/store/slices/authSlice';

export function useAuthRestore() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(restoreAuthFromStorage());
  }, [dispatch]);
}
