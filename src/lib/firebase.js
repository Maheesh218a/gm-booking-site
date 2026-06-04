import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCwrM6i5ksGz2OUxhHVA8hmYGxT2HIEUEs",
  authDomain: "gm-bookings.firebaseapp.com",
  projectId: "gm-bookings",
  storageBucket: "gm-bookings.firebasestorage.app",
  messagingSenderId: "871826366232",
  appId: "1:871826366232:web:9b6f04e2c3d7c24edec86d",
  measurementId: "G-K7P433Y93X"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
