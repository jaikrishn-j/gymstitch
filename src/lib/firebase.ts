import { initializeApp } from "firebase/app";
import { browserLocalPersistence, connectAuthEmulator, getAuth, setPersistence } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectStorageEmulator, getStorage } from "firebase/storage";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";

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

// Connect to Emulators in Development Mode

connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
connectFirestoreEmulator(db, "127.0.0.1", 8080);
connectStorageEmulator(storage, "127.0.0.1", 9199);
connectFunctionsEmulator(functions, "127.0.0.1", 5001);
