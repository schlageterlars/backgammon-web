// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";
import { 
  getAuth, 
  type Auth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  type User 
} from "firebase/auth";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB6OLytaH4E6SClObXZ-bICQDkfjgx6Lss",
  authDomain: "backgammon-f3b85.firebaseapp.com",
  projectId: "backgammon-f3b85",
  storageBucket: "backgammon-f3b85.firebasestorage.app",
  messagingSenderId: "645285200358",
  appId: "1:645285200358:web:ec9b644e2fca203326d627",
  measurementId: "G-QW3S9ZSJMZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Optional analytics
const analytics: Analytics = getAnalytics(app);

// Firebase Auth
const auth: Auth = getAuth(app);
const provider: GoogleAuthProvider = new GoogleAuthProvider();

// Exports
export { auth, provider, signInWithPopup, signOut, onAuthStateChanged, analytics };  export type { User };

