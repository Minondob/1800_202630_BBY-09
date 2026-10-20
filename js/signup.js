import { auth, db } from "./firebaseConfig.js";
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const role = sessionStorage.getItem("role");
if (!role) location.href = "index.html"; // skipped the role page

const label = role === "tutor" ? "Tutor" : "Student";
document.getElementById("heading").textContent = `${label} account set-up:`;
document.getElementById("createBtn").textContent = `Create ${label} account`;

const errorBox = document.getElementById("error");
function showError(msg) { errorBox.textContent = msg; errorBox.classList.remove("d-none"); }

document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.classList.add("d-none");
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!firstName || !lastName || !email || password.length < 6) {
    return showError("Enter your first and last name, an email, and a password of at least 6 characters.");
  }
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: `${firstName} ${lastName}` });
    await setDoc(doc(db, "users", cred.user.uid), {
      firstName, lastName, email, role, profileComplete: false, createdAt: serverTimestamp()
    });
    location.href = "profile.html";
  } catch (err) {
    console.error(err);
    const msgs = {
      "auth/email-already-in-use": "That email already has an account.",
      "auth/invalid-email": "That email address isn't valid.",
      "auth/weak-password": "Choose a password with at least 6 characters."
    };
    showError(msgs[err.code] || `Couldn't create the account (${err.code}).`);
  }
});
