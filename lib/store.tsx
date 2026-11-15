import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  auth,
  db,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from './firebase';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from './firebase';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { firebaseConfigured } from './config';
import { explainLabel } from './explain';
import { signInWithGoogle } from './google';
import type { Explanation, HistoryEntry, Reminder, SavedMedicine } from './types';

const SAVED_KEY = 'mediguide:saved:v1';
const HISTORY_KEY = 'mediguide:history:v1';
const HISTORY_LIMIT = 20;

export interface AuthUser {
  uid: string;
  name: string | null;
  email: string | null;
  photo: string | null;
  /** 'google.com' or 'password' — how this account signs in. */
  provider: string | null;
}

export interface AppState {
  /** The label text being typed — never persisted; every visit starts fresh. */
  labelText: string;
  current: Explanation | null;
  /** Draft schedule for the current explanation (editable before saving). */
  draftReminders: Reminder[];
  loading: boolean;
  error: string | null;
  /** True when the live backend was configured but did not answer. */
  liveFailed: boolean;
  saved: SavedMedicine[];
  history: HistoryEntry[];
  user: AuthUser | null;
  authReady: boolean;
  guest: boolean;
  signIn: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
  setAvatarData: (dataUrl: string) => Promise<void>;
  sendPasswordReset: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  setLabelText: (text: string) => void;
  explain: (label?: string) => Promise<void>;
  refreshCurrent: () => Promise<void>;
  clearCurrent: () => void;
  setDraftReminder: (id: string, patch: Partial<Reminder>) => void;
  addDraftReminder: () => void;
  removeDraftReminder: (id: string) => void;
  saveCurrent: () => void;
  toggleSaved: (explanation: Explanation) => void;
  clearSaved: () => void;
  updateSavedReminder: (savedId: string, reminderId: string, patch: Partial<Reminder>) => void;
  addSavedReminder: (savedId: string) => void;
  removeSavedReminder: (savedId: string, reminderId: string) => void;
  applyHistory: (entry: HistoryEntry) => Promise<void>;
  clearHistory: () => void;
  isSaved: (id: string) => boolean;
  savedById: (id: string) => SavedMedicine | undefined;
  explanationById: (id: string) => Explanation | undefined;
  /** Today's reminders across the cabinet, soonest first. */
  todaysReminders: { medicine: string; reminder: Reminder; savedId: string }[];
}

const AppContext = createContext<AppState | null>(null);

function loadJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function docIdFor(id: string): string {
  return id.replace(/\//g, '-');
}

function remindersFor(explanation: Explanation): Reminder[] {
  return explanation.schedule.map((time, i) => ({
    id: `${explanation.id}-r${i}`,
    time,
    dose: explanation.dose,
    note: '',
    enabled: true,
  }));
}

async function upsertProfile(u: User): Promise<void> {
  if (!firebaseConfigured) return;
  try {
    const ref = doc(db, 'users', u.uid);
    const snap = await getDoc(ref);
    const base = {
      displayName: u.displayName ?? '',
      email: u.email ?? '',
      photoURL: u.photoURL ?? '',
      lastLoginAt: serverTimestamp(),
    };
    if (!snap.exists()) {
      await setDoc(ref, { ...base, createdAt: serverTimestamp() });
    } else {
      await setDoc(ref, base, { merge: true });
    }
  } catch {
    // Sync is best-effort; the app keeps working offline.
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [labelText, setLabelText] = useState('');
  const [current, setCurrent] = useState<Explanation | null>(null);
  const [draftReminders, setDraftReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveFailed, setLiveFailed] = useState(false);
  const [saved, setSaved] = useState<SavedMedicine[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [guest, setGuest] = useState(false);
  const savedRef = useRef<SavedMedicine[]>([]);
  const historyRef = useRef<HistoryEntry[]>([]);
  const historyLoadedRef = useRef(false);
  const cloudUnsubRef = useRef<(() => void) | null>(null);
  const historyUnsubRef = useRef<(() => void) | null>(null);

  // Local (signed-out) data loads once at startup. The label input is
  // NOT restored — every visit starts fresh; past labels live in History.
  useEffect(() => {
    AsyncStorage.getItem(SAVED_KEY).then((raw) => {
      const parsed = loadJson<SavedMedicine[]>(raw);
      if (parsed) setSaved(parsed);
    });
    AsyncStorage.getItem(HISTORY_KEY)
      .then((raw) => {
        const parsed = loadJson<HistoryEntry[]>(raw);
        if (parsed) setHistory(parsed);
      })
      .catch(() => undefined)
      .finally(() => {
        historyLoadedRef.current = true;
      });
  }, []);

  // Keep a local mirror of the cabinet and the history.
  useEffect(() => {
    savedRef.current = saved;
    AsyncStorage.setItem(SAVED_KEY, JSON.stringify(saved)).catch(() => undefined);
  }, [saved]);

  useEffect(() => {
    historyRef.current = history;
    if (!historyLoadedRef.current) return;
    AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history)).catch(() => undefined);
  }, [history]);

  // Auth state: profile write, cloud cabinet + history subscriptions.
  // Readiness waits for Firebase to finish restoring any persisted
  // session from storage — the gate must not decide "signed out" (and
  // show Welcome) before the saved session has had its chance to load.
  useEffect(() => {
    let alive = true;
    void auth.authStateReady().then(() => {
      if (alive) setAuthReady(true);
    });
    const unsub = onAuthStateChanged(auth, (u) => {
      if (cloudUnsubRef.current) {
        cloudUnsubRef.current();
        cloudUnsubRef.current = null;
      }
      if (historyUnsubRef.current) {
        historyUnsubRef.current();
        historyUnsubRef.current = null;
      }
      if (!u) {
        setUser(null);
        return;
      }
      setUser({
        uid: u.uid,
        name: u.displayName,
        email: u.email,
        photo: u.photoURL,
        provider: u.providerData[0]?.providerId ?? null,
      });
      void upsertProfile(u);
      if (!firebaseConfigured) return;

      const savedCol = collection(db, 'users', u.uid, 'saved');
      cloudUnsubRef.current = onSnapshot(
        savedCol,
        (snap) => {
          setSaved(snap.docs.map((d) => d.data() as SavedMedicine));
        },
        () => undefined,
      );

      // One-time merge: anything saved locally before sign-in joins the account.
      void (async () => {
        try {
          const cloud = await getDocs(savedCol);
          const cloudIds = new Set(cloud.docs.map((d) => d.id));
          for (const item of savedRef.current) {
            const id = docIdFor(item.explanation.id);
            if (!cloudIds.has(id)) {
              await setDoc(doc(db, 'users', u.uid, 'saved', id), item);
            }
          }
        } catch {
          // Best-effort merge only.
        }
      })();

      const historyCol = collection(db, 'users', u.uid, 'history');
      historyUnsubRef.current = onSnapshot(
        historyCol,
        (snap) => {
          const cloud = snap.docs.map((d) => d.data() as HistoryEntry);
          setHistory((prev) => {
            const byId = new Map<string, HistoryEntry>();
            for (const e of [...cloud, ...prev]) byId.set(e.id, e);
            return [...byId.values()]
              .sort((a, b) => b.at - a.at)
              .slice(0, HISTORY_LIMIT);
          });
        },
        () => undefined,
      );

      void (async () => {
        try {
          const cloud = await getDocs(historyCol);
          const cloudIds = new Set(cloud.docs.map((d) => d.id));
          for (const entry of historyRef.current) {
            if (!cloudIds.has(entry.id)) {
              await setDoc(doc(db, 'users', u.uid, 'history', entry.id), entry);
            }
          }
        } catch {
          // Best-effort merge only.
        }
      })();

      // Profile doc: a custom avatar / edited name stored there overrides
      // the auth copy.
      void (async () => {
        try {
          const snap = await getDoc(doc(db, 'users', u.uid));
          if (snap.exists()) {
            const data = snap.data();
            setUser((prev) =>
              prev && prev.uid === u.uid
                ? {
                    ...prev,
                    name: (data.displayName as string) || prev.name,
                    photo: (data.photoData as string) || prev.photo,
                  }
                : prev,
            );
          }
        } catch {
          // Keep the auth profile.
        }
      })();
    });
    return () => {
      alive = false;
      unsub();
    };
  }, []);

  const signIn = useCallback(async () => {
    await signInWithGoogle();
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const signUpWithEmail = useCallback(
    async (name: string, email: string, password: string) => {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const cleanName = name.trim();
      if (cleanName) {
        await updateProfile(cred.user, { displayName: cleanName });
        setUser({
          uid: cred.user.uid,
          name: cleanName,
          email: cred.user.email,
          photo: null,
          provider: 'password',
        });
        void upsertProfile({ ...cred.user, displayName: cleanName } as User);
      }
    },
    [],
  );

  const updateDisplayName = useCallback(async (name: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    const clean = name.trim();
    await updateProfile(currentUser, { displayName: clean });
    if (firebaseConfigured) {
      await setDoc(doc(db, 'users', currentUser.uid), { displayName: clean }, { merge: true });
    }
    setUser((prev) => (prev ? { ...prev, name: clean } : prev));
  }, []);

  const setAvatarData = useCallback(async (dataUrl: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    if (firebaseConfigured) {
      await setDoc(doc(db, 'users', currentUser.uid), { photoData: dataUrl }, { merge: true });
    }
    setUser((prev) => (prev ? { ...prev, photo: dataUrl } : prev));
  }, []);

  const sendPasswordReset = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser?.email) return;
    await sendPasswordResetEmail(auth, currentUser.email);
  }, []);

  const resetPasswordForEmail = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    // Back to the welcome screen — the gate routes there as soon as the
    // user is signed out and not a guest.
    setGuest(false);
  }, []);

  const continueAsGuest = useCallback(() => {
    // Deliberately NOT persisted: guest lasts for this visit only, so the
    // next open asks for sign-in again. A signed-in user, by contrast,
    // stays signed in (Firebase Auth persistence).
    setGuest(true);
  }, []);

  const runExplain = useCallback(async (text: string) => {
    setLoading(true);
    setError(null);
    setLiveFailed(false);
    try {
      const { explanation, liveFailed: failed } = await explainLabel(text);
      setCurrent(explanation);
      setDraftReminders(remindersFor(explanation));
      setLiveFailed(failed);
      const entry: HistoryEntry = {
        id: `${explanation.at}`,
        labelText: text.trim(),
        medicineName: explanation.medicineName,
        category: explanation.category,
        at: explanation.at,
      };
      setHistory((prev) =>
        prev.some((e) => e.labelText === entry.labelText)
          ? prev
          : [entry, ...prev].slice(0, HISTORY_LIMIT),
      );
      if (user && firebaseConfigured) {
        void setDoc(doc(db, 'users', user.uid, 'history', entry.id), entry).catch(
          () => undefined,
        );
      }
    } catch (e) {
      setCurrent(null);
      setError(
        e instanceof Error && e.message
          ? e.message
          : 'Something went wrong while explaining that label. Try again.',
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  const explain = useCallback(
    async (label?: string) => {
      const text = (label ?? labelText).trim();
      if (!text) {
        setError('Paste or type a medicine label first.');
        return;
      }
      await runExplain(text);
    },
    [labelText, runExplain],
  );

  const refreshCurrent = useCallback(async () => {
    if (!current) return;
    await runExplain(current.labelText);
  }, [current, runExplain]);

  const clearCurrent = useCallback(() => {
    setCurrent(null);
    setDraftReminders([]);
    setError(null);
    setLiveFailed(false);
  }, []);

  const setDraftReminder = useCallback((id: string, patch: Partial<Reminder>) => {
    setDraftReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    );
  }, []);

  const addDraftReminder = useCallback(() => {
    setDraftReminders((prev) => [
      ...prev,
      { id: `draft-${Date.now()}`, time: '12:00', dose: '', note: '', enabled: true },
    ]);
  }, []);

  const removeDraftReminder = useCallback((id: string) => {
    setDraftReminders((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const saveCurrent = useCallback(() => {
    if (!current) return;
    const item: SavedMedicine = {
      explanation: current,
      reminders: draftReminders,
      savedAt: Date.now(),
    };
    if (user && firebaseConfigured) {
      void setDoc(
        doc(db, 'users', user.uid, 'saved', docIdFor(current.id)),
        item,
      ).catch(() => undefined);
      return;
    }
    setSaved((prev) =>
      prev.some((s) => s.explanation.id === current.id)
        ? prev.map((s) => (s.explanation.id === current.id ? item : s))
        : [item, ...prev],
    );
  }, [current, draftReminders, user]);

  const toggleSaved = useCallback(
    (explanation: Explanation) => {
      if (user && firebaseConfigured) {
        const ref = doc(db, 'users', user.uid, 'saved', docIdFor(explanation.id));
        const already = savedRef.current.some((s) => s.explanation.id === explanation.id);
        if (already) {
          void deleteDoc(ref).catch(() => undefined);
        } else {
          const item: SavedMedicine = {
            explanation,
            reminders: remindersFor(explanation),
            savedAt: Date.now(),
          };
          void setDoc(ref, item).catch(() => undefined);
        }
        return;
      }
      setSaved((prev) =>
        prev.some((s) => s.explanation.id === explanation.id)
          ? prev.filter((s) => s.explanation.id !== explanation.id)
          : [
              {
                explanation,
                reminders: remindersFor(explanation),
                savedAt: Date.now(),
              },
              ...prev,
            ],
      );
    },
    [user],
  );

  const clearSaved = useCallback(() => {
    if (user && firebaseConfigured) {
      void (async () => {
        try {
          const snap = await getDocs(collection(db, 'users', user.uid, 'saved'));
          await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
        } catch {
          // The subscription will reconcile the visible list.
        }
      })();
      return;
    }
    setSaved([]);
  }, [user]);

  const updateSavedReminder = useCallback(
    (savedId: string, reminderId: string, patch: Partial<Reminder>) => {
      const apply = (list: SavedMedicine[]) =>
        list.map((s) =>
          s.explanation.id === savedId
            ? {
                ...s,
                reminders: s.reminders.map((r) =>
                  r.id === reminderId ? { ...r, ...patch } : r,
                ),
              }
            : s,
        );
      setSaved(apply);
      if (user && firebaseConfigured) {
        const item = apply(savedRef.current).find((s) => s.explanation.id === savedId);
        if (item) {
          void setDoc(doc(db, 'users', user.uid, 'saved', docIdFor(savedId)), item).catch(
            () => undefined,
          );
        }
      }
    },
    [user],
  );

  const addSavedReminder = useCallback(
    (savedId: string) => {
      const apply = (list: SavedMedicine[]) =>
        list.map((s) =>
          s.explanation.id === savedId
            ? {
                ...s,
                reminders: [
                  ...s.reminders,
                  {
                    id: `r-${Date.now()}`,
                    time: '12:00',
                    dose: s.explanation.dose,
                    note: '',
                    enabled: true,
                  },
                ],
              }
            : s,
        );
      setSaved(apply);
      if (user && firebaseConfigured) {
        const item = apply(savedRef.current).find((s) => s.explanation.id === savedId);
        if (item) {
          void setDoc(doc(db, 'users', user.uid, 'saved', docIdFor(savedId)), item).catch(
            () => undefined,
          );
        }
      }
    },
    [user],
  );

  const removeSavedReminder = useCallback(
    (savedId: string, reminderId: string) => {
      const apply = (list: SavedMedicine[]) =>
        list.map((s) =>
          s.explanation.id === savedId
            ? { ...s, reminders: s.reminders.filter((r) => r.id !== reminderId) }
            : s,
        );
      setSaved(apply);
      if (user && firebaseConfigured) {
        const item = apply(savedRef.current).find((s) => s.explanation.id === savedId);
        if (item) {
          void setDoc(doc(db, 'users', user.uid, 'saved', docIdFor(savedId)), item).catch(
            () => undefined,
          );
        }
      }
    },
    [user],
  );

  const applyHistory = useCallback(
    async (entry: HistoryEntry) => {
      setLabelText(entry.labelText);
      await runExplain(entry.labelText);
    },
    [runExplain],
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    if (user && firebaseConfigured) {
      void (async () => {
        try {
          const snap = await getDocs(collection(db, 'users', user.uid, 'history'));
          await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
        } catch {
          // The subscription will reconcile the visible list.
        }
      })();
    }
  }, [user]);

  const isSaved = useCallback(
    (id: string) => saved.some((s) => s.explanation.id === id),
    [saved],
  );

  const savedById = useCallback(
    (id: string) => saved.find((s) => s.explanation.id === id),
    [saved],
  );

  const explanationById = useCallback(
    (id: string) =>
      (current?.id === id ? current : undefined) ??
      saved.find((s) => s.explanation.id === id)?.explanation,
    [current, saved],
  );

  const todaysReminders = useMemo(
    () =>
      saved
        .flatMap((s) =>
          s.reminders
            .filter((r) => r.enabled)
            .map((reminder) => ({
              medicine: s.explanation.medicineName,
              reminder,
              savedId: s.explanation.id,
            })),
        )
        .sort((a, b) => a.reminder.time.localeCompare(b.reminder.time)),
    [saved],
  );

  const value = useMemo<AppState>(
    () => ({
      labelText,
      current,
      draftReminders,
      loading,
      error,
      liveFailed,
      saved,
      history,
      user,
      authReady,
      guest,
      signIn,
      signInWithEmail,
      signUpWithEmail,
      updateDisplayName,
      setAvatarData,
      sendPasswordReset,
      resetPasswordForEmail,
      signOut,
      continueAsGuest,
      setLabelText,
      explain,
      refreshCurrent,
      clearCurrent,
      setDraftReminder,
      addDraftReminder,
      removeDraftReminder,
      saveCurrent,
      toggleSaved,
      clearSaved,
      updateSavedReminder,
      addSavedReminder,
      removeSavedReminder,
      applyHistory,
      clearHistory,
      isSaved,
      savedById,
      explanationById,
      todaysReminders,
    }),
    [
      labelText,
      current,
      draftReminders,
      loading,
      error,
      liveFailed,
      saved,
      history,
      user,
      authReady,
      guest,
      signIn,
      signInWithEmail,
      signUpWithEmail,
      updateDisplayName,
      setAvatarData,
      sendPasswordReset,
      resetPasswordForEmail,
      signOut,
      continueAsGuest,
      explain,
      refreshCurrent,
      clearCurrent,
      setDraftReminder,
      addDraftReminder,
      removeDraftReminder,
      saveCurrent,
      toggleSaved,
      clearSaved,
      updateSavedReminder,
      addSavedReminder,
      removeSavedReminder,
      applyHistory,
      clearHistory,
      isSaved,
      savedById,
      explanationById,
      todaysReminders,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
