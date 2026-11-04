import { auth, db } from "./firebaseConfig.js";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

onAuthStateChanged(auth, async (user) => {
  if (!user) return (location.href = "login.html");

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) return (location.href = "role.html");
  const data = snap.data();
  if (!data.profileComplete) return (location.href = "profile.html");

  // textContent (not innerHTML) so profile text can never run as HTML.
  document.getElementById("username").textContent = data.username || `${data.firstName} ${data.lastName}`;
  document.getElementById("role").textContent = data.role === "tutor" ? "Tutor" : "Student";
  document.getElementById("bio").textContent = data.bio || "No description yet.";
  document.getElementById("email").textContent = data.email;
  if (data.avatar) document.getElementById("avatar").src = data.avatar;

  document.getElementById("loading").classList.add("d-none");
  document.getElementById("profile").classList.remove("d-none");
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  location.href = "login.html";
});
