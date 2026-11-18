import { auth, db } from "./firebaseConfig.js";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from "firebase/firestore";

// Get the booking form and page elements
const bookingForm = document.getElementById("tm-booking-form");
const messageBox = document.getElementById("booking-message");
const pastRequests = document.getElementById("past-requests");

const studentInfo = document.getElementById("tm-student-info");
const education = document.getElementById("tm-education");
const studentName = document.getElementById("tm-student-name");

// Store the currently logged-in user
let currentUser = null;

// Display messages
function showMessage(message, type) {
  messageBox.textContent = message;
  messageBox.className = `alert alert-${type}`;
}

// Load previous booking requests from Firestore
async function loadPastRequests(user) {
  try {
    const bookingRef = collection(db, "bookingRequests");

    const q = query(
      bookingRef,
      where("uid", "==", user.uid)
    );

    const querySnapshot = await getDocs(q);

    pastRequests.innerHTML = "";

    if (querySnapshot.empty) {
      pastRequests.textContent = "You have no previous booking requests.";
      return;
    }

    querySnapshot.forEach((doc) => {
      const booking = doc.data();

      const card = document.createElement("div");
      card.className = "card mb-3";

      const cardBody = document.createElement("div");
      cardBody.className = "card-body";

      const name = document.createElement("h5");
      name.textContent = booking.studentName;

      const info = document.createElement("p");
      info.textContent = booking.studentInfo;

      const educationInfo = document.createElement("p");
      educationInfo.textContent = booking.education;

      const status = document.createElement("p");
      status.textContent = `Status: ${booking.status}`;

      cardBody.appendChild(name);
      cardBody.appendChild(info);
      cardBody.appendChild(educationInfo);
      cardBody.appendChild(status);

      card.appendChild(cardBody);
      pastRequests.appendChild(card);
    });

  } catch (error) {
    console.error("Error loading booking requests:", error);
  }
}

// Check whether a user is logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    loadPastRequests(user);
  } else {
    currentUser = null;
    pastRequests.textContent = "Log in to view your previous booking requests.";
  }
});

// Submit booking request
bookingForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!currentUser) {
    showMessage("Please log in before submitting a booking request.", "warning");
    return;
  }

  const bookingData = {
    studentInfo: studentInfo.value,
    education: education.value,
    studentName: studentName.value,
    uid: currentUser.uid,
    email: currentUser.email,
    status: "Pending",
    createdAt: serverTimestamp()
  };

  try {
    await addDoc(collection(db, "bookingRequests"), bookingData);

    showMessage("Your booking request was submitted successfully!", "success");

    bookingForm.reset();

    loadPastRequests(currentUser);

  } catch (error) {
    console.error("Error submitting booking request:", error);
    showMessage("Something went wrong. Please try again.", "danger");
  }
});