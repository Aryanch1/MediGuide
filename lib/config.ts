/**
 * MediGuide runtime config.
 *
 * BACKEND_URL — the deployed Spring Boot backend (POST /api/explain).
 * Set EXPO_PUBLIC_BACKEND_URL at build/deploy time. When it is empty the
 * app runs in its built-in demo mode: curated plain-language explanations
 * and a fully offline schedule builder. No Gemini key ever lives here.
 */
export const BACKEND_URL = (process.env.EXPO_PUBLIC_BACKEND_URL ?? '').trim();

export const backendConfigured = BACKEND_URL.length > 0;

/**
 * Set to true once the Firebase project for MediGuide exists and the
 * values in lib/firebase.ts / lib/firebase.native.ts are the real web
 * config. Project mediguide-b2332 was created 2026-11-15 with
 * Email/Password + Google enabled — full accounts mode is on.
 */
export const firebaseConfigured = true;
