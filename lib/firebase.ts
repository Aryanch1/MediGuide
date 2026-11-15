import { getApp, getApps, initializeApp } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Firebase wiring for MediGuide — web.
 *
 * Project "MediGuide" (mediguide-b2332), created 2026-11-15 under
 * aryanch99999@gmail.com. Email/Password + Google sign-in enabled
 * (email-link OFF); mediguide.vercel.app is an authorized domain.
 * Flip `firebaseConfigured` to true in lib/config.ts once this config
 * is in place (done) — the app then runs in full accounts mode.
 *
 * The config values below are Firebase's public app identifiers — they
 * are designed to ship in client code. Access is controlled by Firebase
 * Authentication plus the Firestore security rules (each user can only
 * read and write their own /users/<uid> tree). No admin keys or secrets
 * live here; the Gemini key stays server-side in the Spring Boot backend.
 *
 * Platform note: this file serves web (and tooling). Native builds use
 * firebase.native.ts instead, which imports the scoped @firebase/*
 * packages — the umbrella 'firebase/auth' entry has no React Native
 * build, so on Android/iOS it silently resolves to the browser build
 * whose sessions live in memory only and are lost when the app closes.
 * Every module imports its Auth/Firestore helpers from './firebase' so
 * each platform always gets one consistent set of Firebase modules.
 */
const firebaseConfig = {
  apiKey: 'AIzaSyAYH2XPKisPEoLU06duZ7tpmEoX-JJ3T2M',
  authDomain: 'mediguide-b2332.firebaseapp.com',
  projectId: 'mediguide-b2332',
  storageBucket: 'mediguide-b2332.firebasestorage.app',
  messagingSenderId: '589918205543',
  appId: '1:589918205543:web:b75bf48786c79898c006c2',
};

/** OAuth web client ID for the native Google Sign-In flow (not a secret). */
export const GOOGLE_WEB_CLIENT_ID = '589918205543-mficdtlb6aekv27rjs5e7iqnc6rbragr.apps.googleusercontent.com';

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = firebaseAuth.getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

export {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  type User,
} from 'firebase/auth';

export {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
