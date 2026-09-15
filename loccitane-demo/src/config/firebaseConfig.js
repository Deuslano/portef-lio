import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDFYXW-JR0QJ2EwQ0RH7Nbn63Ri9sp1fcA",
  authDomain: "loccitanecontas.firebaseapp.com",
  projectId: "loccitanecontas",
  storageBucket: "loccitanecontas.firebasestorage.app",
  messagingSenderId: "415764001266",
  appId: "1:415764001266:web:9d85062b19389161c27b6b",
  measurementId: "G-64LTN5NR1M"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
