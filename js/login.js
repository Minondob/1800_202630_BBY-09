import { auth, db } from "./firebaseConfig.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const statusMsg = document.getElementById("statusMsg");

document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, "users", cred.user.uid));
    location.href = snap.data()?.role === "tutor" ? "inbox.html" : "search.html";
  } catch (error) {
    statusMsg.textContent = "Login failed: " + error.code;
  }
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
});

onAuthStateChanged(auth, (user) => {
  statusMsg.textContent = user ? "Logged in as " + user.email : "Logged out";
  console.log("Auth state:", user ? user.email : "no user");
});