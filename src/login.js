import { auth } from "./firebaseConfig.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

const statusMsg = document.getElementById("statusMsg");

document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    // Redirect only when user explicitly clicks log in and succeeds
    window.location.href = "/search.html";
  } catch (error) {
    statusMsg.textContent = "Login failed: " + error.code;
  }
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  statusMsg.textContent = "Logged out";
});

// onAuthStateChanged should only update UI state, not force redirects on load
onAuthStateChanged(auth, (user) => {
  if (user) {
    statusMsg.textContent = "Logged in as " + user.email;
    console.log("Auth state:", user.email);
  } else {
    statusMsg.textContent = "Logged out";
    console.log("Auth state: no user");
  }
});