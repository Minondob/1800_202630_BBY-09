import { auth, db } from "./firebaseConfig.js";
import { onAuthStateChanged, signOut, EmailAuthProvider, reauthenticateWithCredential, deleteUser } from "firebase/auth";
import { doc, getDoc, collection, getDocs, query, where, writeBatch } from "firebase/firestore";

let deleting = false; // true while deleting, so the sign-out does not bounce to the login page

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    if (!deleting) location.href = "login.html";
    return;
  }

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) return (location.href = "main.html");
  const data = snap.data();
  if (!data.profileComplete) return (location.href = "profile.html");

  // textContent (not innerHTML) so profile text can never run as HTML.
  document.getElementById("username").textContent = data.username || `${data.firstName} ${data.lastName}`;
  document.getElementById("role").textContent = data.role === "tutor" ? "Tutor" : "Student";
  document.getElementById("bio").textContent = data.bio || "No description yet.";
  document.getElementById("email").textContent = data.email;
  if (data.avatar) document.getElementById("avatar").src = data.avatar;

  if (data.role === "tutor" && data.hourlyRate) {
    const r = document.getElementById("rate");
    r.textContent = `$${data.hourlyRate}/hr`;
    r.classList.remove("d-none");
  }

  document.getElementById("loading").classList.add("d-none");
  document.getElementById("profile").classList.remove("d-none");
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  location.href = "login.html";
});

// DELETE ACCOUNT: asks for the password again (Firebase requires a recent login),
// then removes the profile and this user's booking requests, then the login itself.
const deletePanel = document.getElementById("deletePanel");
const deleteError = document.getElementById("deleteError");
const deletePassword = document.getElementById("deletePassword");

function showDeleteError(msg) {
  deleteError.textContent = msg;
  deleteError.classList.remove("d-none");
}

document.getElementById("deleteBtn").addEventListener("click", () => deletePanel.classList.remove("d-none"));
document.getElementById("cancelDeleteBtn").addEventListener("click", () => {
  deletePanel.classList.add("d-none");
  deletePassword.value = "";
  deleteError.classList.add("d-none");
});

document.getElementById("confirmDeleteBtn").addEventListener("click", async () => {
  deleteError.classList.add("d-none");
  const user = auth.currentUser;
  if (!user || !deletePassword.value) return showDeleteError("Enter your password to confirm.");
  try {
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, deletePassword.value));
    // Firestore first (it needs the login), in one batch: the profile plus this user's own booking requests
    const batch = writeBatch(db);
    batch.delete(doc(db, "users", user.uid));
    const requests = await getDocs(query(collection(db, "bookingRequests"), where("uid", "==", user.uid)));
    requests.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    deleting = true;
    await deleteUser(user);
    sessionStorage.clear();
    location.href = "index.html";
  } catch (err) {
    deleting = false;
    console.error(err);
    const wrong = ["auth/wrong-password", "auth/invalid-credential"].includes(err.code);
    showDeleteError(wrong ? "That password isn't right." : "Couldn't delete your account. Please try again.");
  }
});
