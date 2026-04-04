'use client';

import { useAuthRestore } from '@/hooks/useAuthRestore';

export default function AuthRestorer() {
  useAuthRestore();
  return null;
}
