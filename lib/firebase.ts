import { getApp, getApps, initializeApp } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Firebase wiring for MediGuide — web.
 *
 * TODO (needs the Firebase Console, one-time setup): create a Firebase
 * project named "mediguide", enable Email/Password + Google sign-in
 * (email-link OFF), add the Vercel domain to authorized domains, and
 * paste the project's real web config below, then flip
 * `firebaseConfigured` to true in lib/config.ts. Until then the app
 * runs fully in local/guest mode — see README "Firebase setup".
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
  apiKey: 'TODO-REPLACE-WITH-MEDIGUIDE-FIREBASE-API-KEY',
  authDomain: 'TODO-mediguide.firebaseapp.com',
  projectId: 'TODO-mediguide',
  storageBucket: 'TODO-mediguide.firebasestorage.app',
  messagingSenderId: 'TODO',
  appId: 'TODO',
};

/** OAuth web client ID for the native Google Sign-In flow (not a secret). */
export const GOOGLE_WEB_CLIENT_ID = 'TODO-REPLACE-WITH-GOOGLE-WEB-CLIENT-ID';

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
