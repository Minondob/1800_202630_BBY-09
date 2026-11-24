import { auth, db } from "./firebaseConfig.js";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore";

const list = document.getElementById("booking-requests");
const messageBox = document.getElementById("inbox-message");
let tutorUid = null;

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = `alert alert-${type}`;
}

// Stops text from running as HTML.
function esc(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML.replace(/"/g, "&quot;");
}

function requestHtml(id, r) {
  return `
    <div class="border rounded-4 p-3 mb-3">
      <h2 class="h6 fw-bold mb-2">${esc(r.studentName || "Student")}</h2>
      <p class="mb-1 small text-secondary">${esc(r.education || "")}</p>
      <p class="mb-1">${esc(r.studentInfo || "")}</p>
      <p class="mb-3 small text-secondary">${esc(r.date || "No date")} ${esc(r.time || "")}</p>
      <button type="button" class="btn btn-success rounded-pill me-2" data-id="${esc(id)}" data-action="Accepted">Accept</button>
      <button type="button" class="btn btn-outline-danger rounded-pill" data-id="${esc(id)}" data-action="Declined">Decline</button>
    </div>`;
}

// Requests sent to this tutor that are still waiting for an answer
async function loadRequests() {
  try {
    const snap = await getDocs(query(collection(db, "bookingRequests"), where("tutorId", "==", tutorUid)));
    const pending = snap.docs.filter((d) => d.data().status === "Pending");
    list.innerHTML = pending.length
      ? pending.map((d) => requestHtml(d.id, d.data())).join("")
      : `<p class="text-secondary">No new requests.</p>`;
  } catch (error) {
    console.error(error);
    showMessage("Couldn't load requests. Please try again.", "danger");
  }
}

// Accept or Decline: save the new status (Accept also saves a demo meeting link)
async function setStatus(id, status) {
  const update = { status };
  if (status === "Accepted") update.meetingLink = `https://meet.example.com/session-${id.slice(0, 6)}`;
  try {
    await updateDoc(doc(db, "bookingRequests", id), update);
    showMessage(`Request ${status.toLowerCase()}.`, "success");
    loadRequests();
  } catch (error) {
    console.error(error);
    showMessage("Couldn't update the request. Please try again.", "danger");
  }
}

// One click listener for every Accept / Decline button
list.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-id]");
  if (button) setStatus(button.dataset.id, button.dataset.action);
});

onAuthStateChanged(auth, (user) => {
  if (!user) return (location.href = "login.html");
  tutorUid = user.uid;
  loadRequests();
});