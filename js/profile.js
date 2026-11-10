import { auth, db } from "./firebaseConfig.js";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { SUBJECTS } from "./subjects.js";

const preview = document.getElementById("avatarPreview");
const errorBox = document.getElementById("error");
let avatarData = null; // small resized image stored as text

function showError(msg) { errorBox.textContent = msg; errorBox.classList.remove("d-none"); }

// Resize to 200x200 (center-cropped) so it fits easily in a Firestore document.
function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const size = 200, canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      const s = Math.min(img.width, img.height);
      canvas.getContext("2d").drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

onAuthStateChanged(auth, async (user) => {
  // FINAL: UNCOMMENT THE NEXT LINE TO SEND LOGGED-OUT USERS TO THE LOGIN PAGE, AND DELETE THE "TESTING ONLY" LINE UNDER IT.
  // if (!user) return (location.href = "login.html");
  if (!user) return; // TESTING ONLY: STOPS WITHOUT REDIRECTING

  const ref = doc(db, "users", user.uid);
  const data = (await getDoc(ref)).data();
  const isTutor = data.role === "tutor";
  const label = isTutor ? "Tutor" : "Student";

  document.getElementById("heading").textContent = `Set up ${label} profile:`;
  document.getElementById("bioLabel").textContent = `${label} profile details/description`;

  const { firstName: f, lastName: l } = data;
  const options = [`${f} ${l}`, `${f} ${l[0]}.`, `${f[0]}. ${l}`];
  document.getElementById("usernameOptions").innerHTML = options.map((o, i) => `
    <div class="form-check">
      <input class="form-check-input" type="radio" name="username" id="u${i}" value="${o}" ${(data.username ? data.username === o : i === 0) ? "checked" : ""}>
      <label class="form-check-label" for="u${i}">${o}</label>
    </div>`).join("");

  // Subject picker (tutors only)
  const subjectSelect = document.getElementById("subjectSelect");
  const subjectOther = document.getElementById("subjectOther");
  if (isTutor) {
    document.getElementById("subjectBlock").classList.remove("d-none");
    subjectSelect.innerHTML = `<option value="" disabled selected>Select a subject</option>`
      + SUBJECTS.map((s) => `<option>${s}</option>`).join("")
      + `<option value="__other">Other (type your own)</option>`;
    if (data.subject) {
      if (SUBJECTS.includes(data.subject)) subjectSelect.value = data.subject;
      else { subjectSelect.value = "__other"; subjectOther.value = data.subject; subjectOther.classList.remove("d-none"); }
    }
    subjectSelect.addEventListener("change", () =>
      subjectOther.classList.toggle("d-none", subjectSelect.value !== "__other"));
  }

  if (data.avatar) preview.src = data.avatar;
  if (data.bio) document.getElementById("bio").value = data.bio;

  document.getElementById("avatarBtn").addEventListener("click", () => document.getElementById("avatarInput").click());
  document.getElementById("avatarInput").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    avatarData = await resizeImage(file);
    preview.src = avatarData;
  });

  document.getElementById("saveBtn").addEventListener("click", async () => {
    errorBox.classList.add("d-none");
    const update = {
      username: document.querySelector("input[name=username]:checked").value,
      bio: document.getElementById("bio").value.trim(),
      profileComplete: true
    };
    if (isTutor) {
      const subject = subjectSelect.value === "__other" ? subjectOther.value.trim() : subjectSelect.value;
      if (!subject) return showError("Please choose the subject you teach.");
      update.subject = subject;
    }
    if (avatarData) update.avatar = avatarData;
    try {
      await updateDoc(ref, update);
      document.getElementById("profileSection").classList.add("d-none");
      document.getElementById("thanks").classList.remove("d-none");
    } catch (err) {
      console.error(err);
      showError("Couldn't save your profile. Check your connection and try again.");
    }
  });
});
