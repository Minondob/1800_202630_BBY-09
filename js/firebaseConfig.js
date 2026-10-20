// Shared Firebase setup. Every page imports { auth, db } from here.
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBu4ILHmdFlyDxiMGzDwRi7sXQ0C4M9f_o",
  authDomain: "bby-9-firebase.firebaseapp.com",
  projectId: "bby-9-firebase",
  storageBucket: "bby-9-firebase.firebasestorage.app",
  messagingSenderId: "44991012590",
  appId: "1:44991012590:web:e76f4565f77a490ec69dff"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
