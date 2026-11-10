import { db } from "./firebaseConfig.js";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";

const tutors = [
  { tutor_id: "tutor_001", first_name: "Maya", last_name: "Chen",
    subjects: ["Calculus II", "Linear Algebra"], subject_category: "Math",
    age_groups: ["College"], distance_km: 2, hourly_rate: 25,
    rating_average: 4.8, bio: "Math grad student.", profile_photo_url: "" },
  { tutor_id: "tutor_002", first_name: "Sam", last_name: "Patel",
    subjects: ["Chemistry", "Biology"], subject_category: "Science",
    age_groups: ["High school", "College"], distance_km: 5, hourly_rate: 20,
    rating_average: 4.5, bio: "Science peer tutor.", profile_photo_url: "" },
  { tutor_id: "tutor_003", first_name: "Lena", last_name: "Okafor",
    subjects: ["Physics"], subject_category: "Science",
    age_groups: ["High school"], distance_km: 8, hourly_rate: 30,
    rating_average: 4.9, bio: "High-school teacher.", profile_photo_url: "" },
  { tutor_id: "tutor_004", first_name: "Alex", last_name: "Morgan",
    subjects: ["Algebra", "Geometry"], subject_category: "Math",
    age_groups: ["Elementary", "High school"], distance_km: 3, hourly_rate: 18,
    rating_average: 4.6, bio: "Patient math tutor for younger students.", profile_photo_url: "" },
  { tutor_id: "tutor_005", first_name: "Mark", last_name: "Singh",
    subjects: ["Pre-Calculus"], subject_category: "Math",
    age_groups: ["High school"], distance_km: 12, hourly_rate: 30,
    rating_average: 4.7, bio: "Helps with exam prep.", profile_photo_url: "" },
  { tutor_id: "tutor_006", first_name: "Bob", last_name: "Lee",
    subjects: ["World History", "Geography"], subject_category: "Social Studies",
    age_groups: ["High school", "College"], distance_km: 15, hourly_rate: 22,
    rating_average: 4.3, bio: "History major.", profile_photo_url: "" },
  { tutor_id: "tutor_007", first_name: "Priya", last_name: "Nair",
    subjects: ["French", "Spanish"], subject_category: "Language Arts",
    age_groups: ["Elementary", "High school"], distance_km: 6, hourly_rate: 28,
    rating_average: 4.8, bio: "Language teacher.", profile_photo_url: "" },
  { tutor_id: "tutor_008", first_name: "Chris", last_name: "Karth",
    subjects: ["English Literature", "Essay Writing"], subject_category: "English",
    age_groups: ["High school"], distance_km: 20, hourly_rate: 35,
    rating_average: 4.4, bio: "12 years teaching English.", profile_photo_url: "" },
  { tutor_id: "tutor_009", first_name: "Jenna", last_name: "Park",
    subjects: ["Reading", "Phonics"], subject_category: "English",
    age_groups: ["Elementary"], distance_km: 4, hourly_rate: 15,
    rating_average: 4.9, bio: "Early reading specialist.", profile_photo_url: "" },
  { tutor_id: "tutor_010", first_name: "Omar", last_name: "Haddad",
    subjects: ["Economics", "Politics"], subject_category: "Social Studies",
    age_groups: ["College"], distance_km: 30, hourly_rate: 45,
    rating_average: 4.6, bio: "Economics grad student.", profile_photo_url: "" }
];

// ---- Filters come from the URL (search.html?subject=Math&max=50) ----
const params = new URLSearchParams(location.search);
const subjects = params.get("subject")?.split(",") ?? [];
const ages = params.get("age")?.split(",") ?? [];
const maxPrice = Number(params.get("max")) || null; // null = no limit
const maxDist = Number(params.get("dist")) || null;

const list = document.getElementById("tutorList");
const searchInput = document.getElementById("searchInput");
let allTutors = [];

// true if the tutor passes every filter that was chosen
function matches(t) {
  if (subjects.length && !subjects.includes(t.subject_category)) return false;
  if (ages.length && !ages.some((a) => t.age_groups?.includes(a))) return false;
  if (maxPrice && t.hourly_rate > maxPrice) return false;
  if (maxDist && (t.distance_km ?? Infinity) > maxDist) return false;
  return true;
}

// true if the search box text appears in the tutor's name or subjects
function matchesText(t, text) {
  if (!text) return true;
  return `${t.first_name} ${t.last_name} ${t.subjects.join(" ")}`.toLowerCase().includes(text);
}

// Stops text from running as HTML.
function esc(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML.replace(/"/g, "&quot;");
}

// Photo if the tutor has one, otherwise a coloured circle with their initials.
function avatarHtml(t) {
  if (t.profile_photo_url) {
    return `<div class="tutor-avatar"><img src="${esc(t.profile_photo_url)}" alt=""></div>`;
  }
  const initials = (t.first_name[0] + t.last_name[0]).toUpperCase();
  const colour = [...(t.first_name + t.last_name)].reduce((sum, c) => sum + c.charCodeAt(0), 0) % 5;
  return `<div class="tutor-avatar av-${colour}" aria-hidden="true">${esc(initials)}</div>`;
}

function cardHtml(t) {
  const tags = t.subjects.slice(0, 3).map((s) => `<span class="tag">${esc(s)}</span>`).join("");
  const dist = t.distance_km != null ? `${t.distance_km} km away` : "";
  return `
    <article class="tutor-card">
      ${avatarHtml(t)}
      <div class="tutor-info">
        <div class="tutor-top">
          <h2 class="tutor-name">${esc(t.first_name)} ${esc(t.last_name[0])}.</h2>
          <span class="tutor-rating"><span class="star" aria-hidden="true">&#9733;</span> ${Number(t.rating_average).toFixed(1)}</span>
        </div>
        <div class="tutor-tags">${tags}</div>
        <div class="tutor-meta"><span class="tutor-price">$${t.hourly_rate}/hr</span><span>${dist}</span></div>
      </div>
    </article>`;
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

async function loadTutors() {
  try {
    const snap = await getDocs(collection(db, "tutors"));
    allTutors = snap.docs.map((d) => d.data());
    render();
  } catch (error) {
    console.error(error);
    document.getElementById("resultsCount").textContent = "";
    list.textContent = "Couldn't load tutors. Check your connection and try again.";
  }
}

// One-time setup: open search.html?seed=1 to write the sample tutors to Firestore.
async function seedTutors() {
  for (const t of tutors) {
    await setDoc(doc(db, "tutors", t.tutor_id), t);
  }
}

showActiveFilters();
searchInput.addEventListener("input", render);

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