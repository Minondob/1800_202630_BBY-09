import { auth, db } from "./firebaseConfig.js";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, collection, getDocs, query, where } from "firebase/firestore";

// ---- Sample tutors, saved in the "users" collection like real tutors ----
// Run once: open search.html?seed=1
const sampleTutors = [
  { id: "tutor_001", firstName: "Maya", lastName: "Chen", subject: "Calculus", hourlyRate: 25, rating: 4.8, ageGroups: ["College"], distanceKm: 2, bio: "Math grad student." },
  { id: "tutor_002", firstName: "Sam", lastName: "Patel", subject: "Chemistry", hourlyRate: 20, rating: 4.5, ageGroups: ["High school", "College"], distanceKm: 5, bio: "Science peer tutor." },
  { id: "tutor_003", firstName: "Lena", lastName: "Okafor", subject: "Physics", hourlyRate: 30, rating: 4.9, ageGroups: ["High school"], distanceKm: 8, bio: "High-school teacher." },
  { id: "tutor_004", firstName: "Alex", lastName: "Morgan", subject: "Mathematics", hourlyRate: 18, rating: 4.6, ageGroups: ["Elementary", "High school"], distanceKm: 3, bio: "Patient math tutor for younger students." },
  { id: "tutor_005", firstName: "Mark", lastName: "Singh", subject: "Statistics", hourlyRate: 30, rating: 4.7, ageGroups: ["College"], distanceKm: 12, bio: "Helps with exam prep." },
  { id: "tutor_006", firstName: "Bob", lastName: "Lee", subject: "History", hourlyRate: 22, rating: 4.3, ageGroups: ["High school", "College"], distanceKm: 15, bio: "History major." },
  { id: "tutor_007", firstName: "Priya", lastName: "Nair", subject: "French", hourlyRate: 28, rating: 4.8, ageGroups: ["Elementary", "High school"], distanceKm: 6, bio: "Language teacher." },
  { id: "tutor_008", firstName: "Chris", lastName: "Karth", subject: "English", hourlyRate: 35, rating: 4.4, ageGroups: ["High school"], distanceKm: 20, bio: "12 years teaching English." },
  { id: "tutor_009", firstName: "Jenna", lastName: "Park", subject: "English", hourlyRate: 15, rating: 4.9, ageGroups: ["Elementary"], distanceKm: 4, bio: "Early reading specialist." },
  { id: "tutor_010", firstName: "Omar", lastName: "Haddad", subject: "Economics", hourlyRate: 45, rating: 4.6, ageGroups: ["College"], distanceKm: 30, bio: "Economics grad student." }
];

// The filter page has 5 groups. Tutors pick a subject from the longer list in subjects.js.
const CATEGORY = {
  Mathematics: "Math", Calculus: "Math", Statistics: "Math",
  Physics: "Science", Chemistry: "Science", Biology: "Science",
  English: "English",
  French: "Language Arts", Spanish: "Language Arts", Mandarin: "Language Arts",
  History: "Social Studies", Geography: "Social Studies", Economics: "Social Studies", Psychology: "Social Studies"
};

const DEFAULT_RATE = 25;
const DEFAULT_DISTANCE_KM = 5;

// ---- Filters come from the URL (search.html?subject=Math&max=50) ----
const params = new URLSearchParams(location.search);
const subjects = params.get("subject")?.split(",") ?? [];
const ages = params.get("age")?.split(",") ?? [];
const maxPrice = Number(params.get("max")) || null; // null = no limit
const maxDist = Number(params.get("dist")) || null;

const list = document.getElementById("tutorList");
const searchInput = document.getElementById("searchInput");
let allTutors = [];

function matches(t) {
  const rate = t.hourlyRate != null && t.hourlyRate !== "" ? Number(t.hourlyRate) : DEFAULT_RATE;
  const dist = t.distanceKm != null && t.distanceKm !== "" ? Number(t.distanceKm) : DEFAULT_DISTANCE_KM;

  if (subjects.length && !subjects.includes(CATEGORY[t.subject])) return false;
  if (ages.length && t.ageGroups && !ages.some((a) => t.ageGroups.includes(a))) return false;
  if (maxPrice && rate > maxPrice) return false;
  if (maxDist && dist > maxDist) return false;
  return true;
}

function nameOf(t) {
  return t.username || `${t.firstName} ${t.lastName}`;
}

// true if the search box text appears in the tutor's name or subject
function matchesText(t, text) {
  return `${nameOf(t)} ${t.subject}`.toLowerCase().includes(text);
}

// Stops text from running as HTML.
function esc(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML.replace(/"/g, "&quot;");
}

// Photo if the tutor has one, otherwise a coloured circle with their initials.
function avatarHtml(t) {
  if (t.avatar) return `<div class="tutor-avatar"><img src="${esc(t.avatar)}" alt=""></div>`;
  const initials = (t.firstName[0] + t.lastName[0]).toUpperCase();
  const colour = [...nameOf(t)].reduce((sum, c) => sum + c.charCodeAt(0), 0) % 5;
  return `<div class="tutor-avatar av-${colour}" aria-hidden="true">${esc(initials)}</div>`;
}

function cardHtml(t) {
  const ratingValue = t.rating != null && t.rating !== "" ? Number(t.rating).toFixed(1) : "New";
  const rating = `<span class="tutor-rating"><span class="star" aria-hidden="true">&#9733;</span> ${esc(ratingValue)}</span>`;

  const rate = t.hourlyRate != null && t.hourlyRate !== "" ? Number(t.hourlyRate) : DEFAULT_RATE;
  const dist = t.distanceKm != null && t.distanceKm !== "" ? Number(t.distanceKm) : DEFAULT_DISTANCE_KM;

  const price = `$${esc(rate)}/hr`;
  const distText = `${esc(dist)} km away`;

  return `
    <a class="tutor-card" href="viewprofile.html?id=${encodeURIComponent(t.id)}">
      ${avatarHtml(t)}
      <div class="tutor-info">
        <div class="tutor-top"><h2 class="tutor-name">${esc(nameOf(t))}</h2>${rating}</div>
        <div class="tutor-tags"><span class="tag">${esc(t.subject)}</span></div>
        <div class="tutor-meta"><span class="tutor-price">${price}</span><span>${distText}</span></div>
      </div>
    </a>`;
}

// "Math" "High school" "under $50/hr" "within 10 km" shown above the results
function showActiveFilters() {
  const parts = [...subjects, ...ages];
  if (maxPrice) parts.push(`under $${maxPrice}/hr`);
  if (maxDist) parts.push(`within ${maxDist} km`);
  if (!parts.length) return;

  const box = document.getElementById("activeFilters");
  box.innerHTML = parts.map((p) => `<span class="active-filter">${esc(p)}</span>`).join("")
    + `<a href="search.html" class="clear-link">Clear filters</a>`;
  box.classList.remove("d-none");

  const badge = document.getElementById("filterBadge");
  badge.textContent = parts.length;
  badge.classList.remove("d-none");
}

// Show the tutors that pass the filters and the search box
function render() {
  const text = searchInput.value.trim().toLowerCase();
  const found = allTutors.filter((t) => matches(t) && matchesText(t, text));
  document.getElementById("resultsCount").textContent = `Results: ${found.length} found`;
  list.innerHTML = found.length
    ? found.map(cardHtml).join("")
    : `<p class="empty-state">No tutors match. Try a different search or <a href="filter.html">change the filters</a>.</p>`;
}

// Real tutors = users with role "tutor" and a finished profile
async function loadTutors() {
  try {
    const snap = await getDocs(query(collection(db, "users"), where("role", "==", "tutor")));
    allTutors = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((t) => t.profileComplete && t.subject);
    render();
  } catch (error) {
    console.error(error);
    document.getElementById("resultsCount").textContent = "";
    list.textContent = "Couldn't load tutors. Check your connection and try again.";
  }
}

async function seedTutors() {
  for (const { id, ...tutor } of sampleTutors) {
    await setDoc(doc(db, "users", id), {
      ...tutor,
      username: `${tutor.firstName} ${tutor.lastName}`,
      role: "tutor",
      profileComplete: true
    });
  }
}

showActiveFilters();
searchInput.addEventListener("input", render);

// Only logged-in users can see tutors
onAuthStateChanged(auth, (user) => {
  if (!user) return (location.href = "login.html");

  if (params.get("seed") === "1") {
    seedTutors()
      .then(() => location.replace("search.html"))
      .catch((error) => {
        console.error(error);
        list.textContent = "Couldn't write the sample tutors. Check the console.";
      });
  } else {
    loadTutors();
  }
});