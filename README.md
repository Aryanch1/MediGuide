# MediGuide

**Know your medicine.** Paste any medicine label and MediGuide explains it in plain, simple words — what it is for, how to take it, and what to watch out for — then builds a reminder schedule you can actually follow.

Built for caregivers, elderly people, and anyone who has ever stared at a prescription label and thought *"what does this actually mean?"*

> **Not medical advice — ask your doctor or pharmacist.** MediGuide is general information only. If a label says something different from what the app shows, always follow the label and your doctor.

Copyright (c) 2026 Aryanmouli Cherupalli

## Features

- **Plain-language explanations** — paste a label, get what it's for, how to take it, and key warnings in simple words. Includes built-in sample labels to try in one tap.
- **Reminder schedule builder** — the times on the label become a daily schedule. Edit any time or dose, turn reminders on or off.
- **Medicine cabinet** — save explained medicines with their schedules; re-open any past explanation from History in one tap.
- **Accounts** — sign in with Google or email/password (or continue as a guest for one visit). Signed-in users stay signed in; profiles, pictures and display names are editable; per-user data lives under `users/{uid}` with owner-only rules.
- **Premium design** — calm teal theme, frosted-glass surfaces, Sora display type, spring animations, a capsule-filling pull-to-refresh, and a floating glass tab bar. Responsive from 5-inch phones to foldables, tablets and desktop.

## Live

- **Web app:** coming once deployed (Vercel) — see below
- **GitHub:** https://github.com/Aryanch1/MediGuide
- **Design (Figma):** https://www.figma.com/design/0FIqvwkTT1AmYzPLsINlO8

## How to run

### Web / development

```bash
npm install
npx expo start --web
```

### Android / iOS

```bash
npx expo start
# Scan the QR code with Expo Go, or:
npm run android
npm run ios
```

An `eas.json` preview profile is included for an APK build (`eas build -p android --profile preview`).

### Backend (Spring Boot, Java 17+)

The AI lives in `backend/` — a Spring Boot service that calls Google Gemini server-side. The key is never in the app.

```bash
cd backend
export GEMINI_API_KEY=your-key   # Google AI Studio key, server-side only
./mvnw test                      # or: mvn test
./mvnw spring-boot:run           # serves POST /api/explain on :8080
```

Point the app at it with `EXPO_PUBLIC_BACKEND_URL=https://your-backend-host` (see `.env.example`).
**Without a backend configured, the app runs in demo mode**: curated explanations for common medicines (amoxicillin, paracetamol, metformin, atorvastatin, salbutamol, cetirizine, omeprazole, vitamin D3) plus a generic parser, and the schedule builder works fully offline. The UI always says which mode it is in.

## Firebase setup (one-time, for accounts & sync)

The accounts code is complete; the Firebase project does not exist yet. To enable it:

1. In the [Firebase Console](https://console.firebase.google.com), create a project named `mediguide`.
2. Enable **Authentication → Email/Password** and **Google** (email-link/passwordless OFF).
3. Create a **Firestore** database and deploy `firestore.rules` (owner-only `users/{uid}` access).
4. Add the app's Vercel domain to **Authentication → Authorized domains**.
5. Paste the project's web config into `lib/firebase.ts` and `lib/firebase.native.ts` (replacing the `TODO` values), add the Google web client ID, and set `firebaseConfigured = true` in `lib/config.ts`.
6. Restrict the project's Browser key in Google Cloud Console (HTTP referrers = the app's own domains + localhost; APIs limited to Identity Toolkit, Token Service, Cloud Firestore, Firebase Installations).

Until then the app runs fully in local/guest mode.

## Tech stack

- React Native + Expo SDK 58 + TypeScript (one codebase: Android, iOS, web)
- Spring Boot (Java 17) backend — `POST /api/explain` → Google Gemini `gemini-3.5-flash-lite`
- Firebase Auth + Firestore (accounts & per-user sync)
- React Native Reanimated (spring physics), expo-blur (frosted glass), expo-haptics, expo-linear-gradient
- Designed in Figma; Sora display typeface

## License

MIT License — Copyright (c) 2026 Aryanmouli Cherupalli. See [LICENSE](LICENSE).
