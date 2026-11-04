import { auth, db } from "./firebaseConfig.js";; // must export both auth and db
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";

const bookingForm = document.getElementById("tm-booking-form");
const messageBox = document.getElementById("booking-message");
const pastList = document.getElementById("past-requests");
let currentUser = null;

function showMessage(type, text) {
  const div = document.createElement("div");
  div.className = `alert alert-${type}`;
  div.textContent = text;
  messageBox.replaceChildren(div);
}

// READ: this student's previous booking requests
async function loadPastRequests(user) {
  if (!pastList) return;
  try {
    // where() only, no orderBy: avoids needing a Firestore composite index. Sorted below.
    const snap = await getDocs(query(collection(db, "bookingRequests"), where("uid", "==", user.uid)));
    if (snap.empty) {
      pastList.textContent = "You haven't made any booking requests yet.";
      return;
    }
    const requests = snap.docs
      .map((d) => d.data())
      .sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));

    pastList.replaceChildren(...requests.map((r) => {
      const card = document.createElement("div");
      card.className = "card mb-2";
      const body = document.createElement("div");
      body.className = "card-body";
      const date = r.createdAt ? r.createdAt.toDate().toLocaleDateString() : "";
      // textContent (not innerHTML) so student-typed text can't run as HTML
      const title = document.createElement("h3");
      title.className = "h6";
      title.textContent = `${r.studentName} (${r.education})`;
      const info = document.createElement("p");
      info.className = "mb-1";
      info.textContent = r.studentInfo;
      const meta = document.createElement("small");
      meta.className = "text-secondary";
      meta.textContent = `${date} - Status: ${r.status}`;
      body.append(title, info, meta);
      card.append(body);
      return card;
    }));
  } catch (error) {
    console.error("Error loading booking requests:", error);
    pastList.textContent = "Couldn't load your past requests.";
  }
}

// Wait for Firebase to say who is logged in
onAuthStateChanged(auth, (user) => {
  if (!user) return (location.href = "login.html");
  currentUser = user;
  loadPastRequests(user);
});

// WRITE: save a new booking request linked to the logged-in account
if (bookingForm) {
  bookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!currentUser) return showMessage("danger", "Please log in to submit a booking request.");

    const studentInfo = document.getElementById("tm-student-info").value;
    const education = document.getElementById("tm-education").value;
    const studentName = document.getElementById("tm-student-name").value;

    try {
      await addDoc(collection(db, "bookingRequests"), {
        studentInfo,
        education,
        studentName,
        uid: currentUser.uid,
        email: currentUser.email,
        status: "pending",
        createdAt: serverTimestamp()
      });
      showMessage("success", "Booking request submitted successfully!");
      bookingForm.reset();
      loadPastRequests(currentUser); // refresh the list
    } catch (error) {
      console.error("Error submitting booking:", error);
      showMessage("danger", "Unable to submit booking. Please try again.");
    }
  });
}
