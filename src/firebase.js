// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);