import { auth, db } from "./firebaseConfig.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const preview = document.getElementById("avatarPreview");
const errorBox = document.getElementById("error");
let avatarData = null; // small resized image stored as text (no Storage billing needed)

function showError(msg) { errorBox.textContent = msg; errorBox.classList.remove("d-none"); }

// Resize the chosen image to 200x200 so it fits easily in a Firestore document.
function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const size = 200, canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      const s = Math.min(img.width, img.height); // center-crop to a square
      canvas.getContext("2d").drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

onAuthStateChanged(auth, async (user) => {
  if (!user) return (location.href = "index.html");
  const ref = doc(db, "users", user.uid);
  const data = (await getDoc(ref)).data();
  const label = data.role === "tutor" ? "Tutor" : "Student";

  document.getElementById("heading").textContent = `Set up ${label} profile:`;
  document.getElementById("bioLabel").textContent = `${label} profile details/description`;

  // Username choices built from the name entered at sign-up.
  const { firstName: f, lastName: l } = data;
  const options = [`${f} ${l[0]}.`, `${f} ${l}`, `${f[0]}. ${l}`];
  document.getElementById("usernameOptions").innerHTML = options.map((o, i) => `
    <div class="form-check">
      <input class="form-check-input" type="radio" name="username" id="u${i}" value="${o}" ${i === 0 ? "checked" : ""}>
      <label class="form-check-label" for="u${i}">${o}</label>
    </div>`).join("");

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
