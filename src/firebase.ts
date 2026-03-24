import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import firebaseConfigImport from "../firebase-applet-config.json";

export const firebaseConfig = firebaseConfigImport;

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use initializeFirestore with experimentalForceLongPolling: true to fix connection issues
// and ensure we use the specific database ID from the config
const databaseId = (firebaseConfig as any).firestoreDatabaseId;
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, databaseId || '(default)');

export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
