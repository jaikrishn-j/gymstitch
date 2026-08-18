import { initializeApp } from "firebase/app";
import { browserLocalPersistence, connectAuthEmulator, getAuth, setPersistence } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectStorageEmulator, getStorage } from "firebase/storage";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: "AIzaSyDSMW7yN3neKjag9e7jNVUHMijaL68zJ6I",
  authDomain: "gym-management-e3d42.firebaseapp.com",
  projectId: "gym-management-e3d42",
  storageBucket: "gym-management-e3d42.firebasestorage.app",
  messagingSenderId: "773621881395",
  appId: "1:773621881395:web:2caaceb1f6fb25ad686146",
  measurementId: "G-3WYM03LX3Q"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize and Export Services
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// App Check (production attestation; debug provider in dev via console token).
// Only activate once a reCAPTCHA Enterprise site key is configured, otherwise
// the provider is unusable and every token request fails.
const appCheckSiteKey = import.meta.env.VITE_APP_CHECK_SITE_KEY;
if (import.meta.env.DEV) {
  const debugToken = import.meta.env.VITE_APP_CHECK_DEBUG_TOKEN;
  (self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: string | boolean }).FIREBASE_APPCHECK_DEBUG_TOKEN =
    debugToken || true;
}
if (appCheckSiteKey) {
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
}

// Connect to Emulators in Development Mode only
if (import.meta.env.DEV) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectStorageEmulator(storage, "127.0.0.1", 9199);
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}
