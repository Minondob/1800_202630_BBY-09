import { auth, db } from "./firebaseConfig.js";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";

const grid = document.getElementById("tutorGrid");

function makeCard(t) {
  const col = document.createElement("div");
  col.className = "col-6";
  const card = document.createElement("div");
  card.className = "tutor-card";

  const img = document.createElement("img");
  img.className = "avatar";
  img.alt = "";
  if (t.avatar) img.src = t.avatar;

  const name = document.createElement("h2");
  name.textContent = t.username || `${t.firstName} ${t.lastName}`;
  const subject = document.createElement("p");
  subject.textContent = t.subject;

  const btn = document.createElement("a");
  btn.className = "btn btn-pill";
  btn.textContent = "View Profile";
  btn.href = `viewprofile.html?id=${encodeURIComponent(t.id)}`;

  card.append(img, name, subject, btn);
  col.append(card);
  return col;
}

async function loadTutors() {
  try {
    const snap = await getDocs(query(collection(db, "users"), where("role", "==", "tutor")));
    // Complete profile = profileComplete AND a subject. No subject = incomplete = hidden.
    const tutors = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((t) => t.profileComplete && t.subject)
      .sort((a, b) => (a.username || "").localeCompare(b.username || ""));
    if (!tutors.length) return (grid.textContent = "No tutors with a complete profile yet.");
    grid.replaceChildren(...tutors.map(makeCard));
  } catch (err) {
    console.error(err);
    grid.textContent = "Couldn't load tutors.";
  }
}

onAuthStateChanged(auth, () => {
  // FINAL: UNCOMMENT THE NEXT LINE TO REQUIRE LOGIN (ALSO ADD "user" AS THE PARAMETER ABOVE). LEAVE COMMENTED WHILE TESTING.
  // if (!user) return (location.href = "login.html");
  loadTutors();
});
