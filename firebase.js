import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDdOkT_Pw5-a760jWwecZGqNJTXYbepojQ",
  authDomain: "book-my-ride-757813.firebaseapp.com",
  projectId: "book-my-ride-757813",
  storageBucket: "book-my-ride-757813.firebasestorage.app",
  messagingSenderId: "369779442955",
  appId: "1:369779442955:web:db09c308095f50ee558e0e",
  // measurementId: "G-ELNF0P9PY7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
