// src/Firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAAZIwJMIl8VY22iieRgcaOCa3gvUISi9U",
  authDomain: "smartvault-73088.firebaseapp.com",
  projectId: "smartvault-73088",
  storageBucket: "smartvault-73088.appspot.com", // ✅ correct
  messagingSenderId: "268636254744",
  appId: "1:268636254744:web:280863adab60f523d7896d",
  measurementId: "G-HP5CBJNCT6",
};



// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
