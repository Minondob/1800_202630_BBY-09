import { auth, db } from "./firebaseConfig.js";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const status = document.getElementById("status");
const tutorId = new URLSearchParams(location.search).get("id");

// Message button is a placeholder for now.
document.querySelectorAll("[data-message]").forEach((b) =>
  b.addEventListener("click", () => console.log("Message tutor clicked:", tutorId)));

async function loadTutor() {
  if (!tutorId) return showStatus("No tutor selected.");
  try {
    const snap = await getDoc(doc(db, "users", tutorId));
    const t = snap.exists() ? snap.data() : null;
    if (!t || t.role !== "tutor") return showStatus("Tutor not found.");
    if (!t.profileComplete || !t.subject) return showStatus("This tutor hasn't finished their profile yet.");

    // textContent only, so profile text can never run as HTML
    document.getElementById("name").textContent = t.username || `${t.firstName} ${t.lastName}`;
    document.getElementById("bio").textContent = t.bio || "No details yet.";
    document.getElementById("subject").textContent = t.subject;
    if (t.avatar) document.getElementById("avatar").src = t.avatar;

    // No rating data exists yet, so this shows 0 stars until a "rating" field is added.
    const rating = Math.round(Number(t.rating) || 0);
    document.getElementById("stars").replaceChildren(...Array.from({ length: 5 }, (_, i) => {
      const star = document.createElement("i");
      star.className = i < rating ? "bi bi-star-fill" : "bi bi-star";
      return star;
    }));
    if (!t.rating) document.getElementById("ratingNote").textContent = "No ratings yet";

    document.getElementById("bookBtn").href = `booking.html?tutor=${encodeURIComponent(tutorId)}`;
    status.classList.add("d-none");
    document.getElementById("tutor").classList.remove("d-none");
  } catch (err) {
    console.error(err);
    showStatus("Couldn't load this tutor.");
  }
}

function showStatus(msg) { status.textContent = msg; }

onAuthStateChanged(auth, () => {
  // FINAL: UNCOMMENT THE NEXT LINE TO REQUIRE LOGIN (ALSO ADD "user" AS THE PARAMETER ABOVE). LEAVE COMMENTED WHILE TESTING.
  // if (!user) return (location.href = "login.html");
  loadTutor();
});
