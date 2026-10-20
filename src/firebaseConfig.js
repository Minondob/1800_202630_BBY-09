import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

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