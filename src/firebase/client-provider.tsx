// src/firebase/client-provider.tsx
"use client";

import { ReactNode } from 'react';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from './index';

// This is a singleton
const firebaseInstance = initializeFirebase();

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  if (!firebaseInstance) {
    return null; 
  }
  
  return <FirebaseProvider value={firebaseInstance}>{children}</FirebaseProvider>;
}
