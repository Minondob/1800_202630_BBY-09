import { db } from "./firebaseConfig.js";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";

const tutors = [
  { tutor_id: "tutor_001", first_name: "Maya", last_name: "Chen",
    subjects: ["Calculus II", "Linear Algebra"], hourly_rate: 25,
    rating_average: 4.8, bio: "Math grad student.", profile_photo_url: "" },
  { tutor_id: "tutor_002", first_name: "Sam", last_name: "Patel",
    subjects: ["COMP 1510", "Java"], hourly_rate: 20,
    rating_average: 4.5, bio: "CST peer tutor.", profile_photo_url: "" },
  { tutor_id: "tutor_003", first_name: "Lena", last_name: "Okafor",
    subjects: ["Physics"], hourly_rate: 30,
    rating_average: 4.9, bio: "High-school teacher.", profile_photo_url: "" }
];

// TASK 1: WRITE tutors to Firestore
async function seedTutors() {
  try {
    for (const t of tutors) {
      await setDoc(doc(db, "tutors", t.tutor_id), t);
    }
    console.log("Tutors written to Firestore");
    loadTutors();
  } catch (error) {
    console.error(error);
  }
}

// TASK 2: READ tutors and show cards
async function loadTutors() {
  const list = document.getElementById("tutorList");
  try {
    const snap = await getDocs(collection(db, "tutors"));
    list.innerHTML = "";
    snap.forEach((d) => {
      const t = d.data();
      list.insertAdjacentHTML("beforeend", `
        <div class="col-12 col-md-6 col-lg-4 mb-3">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">${t.first_name} ${t.last_name}</h5>
              <p class="card-text">${t.subjects.join(", ")}</p>
              <p class="mb-1">$${t.hourly_rate}/hr · ⭐ ${t.rating_average}</p>
              <p class="text-muted small">${t.bio}</p>
            </div>
          </div>
        </div>`);
    });
  } catch (error) {
    console.error(error);
  }
}

const seedBtn = document.getElementById("seedBtn");
if (seedBtn) seedBtn.addEventListener("click", seedTutors);

loadTutors();