import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  type Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  type User,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const env = import.meta.env;

const cfg = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  cfg.apiKey && cfg.projectId && cfg.appId,
);

let app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  app = initializeApp(cfg);
  _auth = getAuth(app);
  _db = getFirestore(app);
  _storage = getStorage(app);
}

export const firebaseApp = app;
export const auth = _auth;
export const db = _db;
export const storage = _storage;

export async function googleSignIn() {
  if (!auth) throw new Error("Firebase not configured");
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

export async function emailSignIn(email: string, password: string) {
  if (!auth) throw new Error("Firebase not configured");
  return signInWithEmailAndPassword(auth, email, password);
}

export async function emailSignUp(email: string, password: string) {
  if (!auth) throw new Error("Firebase not configured");
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function signOut() {
  if (!auth) return;
  return fbSignOut(auth);
}

export function onUserChange(cb: (u: User | null) => void) {
  if (!auth) {
    cb(null);
    return () => {};
  }
  return onAuthStateChanged(auth, cb);
}
