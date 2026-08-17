import { initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDSMW7yN3neKjag9e7jNVUHMijaL68zJ6I",
  authDomain: "gym-management-e3d42.firebaseapp.com",
  projectId: "gym-management-e3d42",
  storageBucket: "gym-management-e3d42.firebasestorage.app",
  messagingSenderId: "773621881395",
  appId: "1:773621881395:web:2caaceb1f6fb25ad686146",
  measurementId: "G-3WYM03LX3Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app)
setPersistence(auth, browserLocalPersistence)
export const db = getFirestore(app)