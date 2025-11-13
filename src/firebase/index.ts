// src/firebase/index.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from '@/firebase/config';

function initializeFirebase() {
  const apps = getApps();
  let app: FirebaseApp;

  if (!apps.length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  return { app, auth, firestore };
}

export { initializeFirebase };
export * from './provider';
export * from './firestore/use-collection';
export * from './auth/use-user';
