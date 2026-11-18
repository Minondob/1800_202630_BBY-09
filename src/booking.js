
import { db } from "./firebaseConfig.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where
} from "firebase/firestore";

// Get the booking form and page elements
const bookingForm = document.getElementById("tm-booking-form");
const bookingFormSection = document.getElementById("booking-form-section");
const requestStatusSection = document.getElementById("request-status-section");
const messageBox = document.getElementById("booking-message");
const pastRequests = document.getElementById("past-requests");

// Get the booking form fields
const studentInfo = document.getElementById("tm-student-info");
const education = document.getElementById("tm-education");
const studentName = document.getElementById("tm-student-name");
const studentEmail = document.getElementById("tm-student-email");
const bookingDate = document.getElementById("booking-date");
const bookingTime = document.getElementById("booking-time");

// Display messages
function showMessage(message, type) {
  messageBox.textContent = message;
  messageBox.className = `alert alert-${type}`;
}

// Load previous booking requests from Firestore
async function loadPastRequests(email) {
  try {
    const bookingRef = collection(db, "bookingRequests");

    const q = query(
      bookingRef,
      where("email", "==", email)
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
      name.textContent = booking.studentName || "Student";

      const emailInfo = document.createElement("p");
      emailInfo.textContent = `Email: ${booking.email || "Not provided"}`;

      const info = document.createElement("p");
      info.textContent = booking.studentInfo || "No learning requirements provided.";

      const educationInfo = document.createElement("p");
      educationInfo.textContent = `Education: ${booking.education || "Not provided"}`;

      const date = document.createElement("p");
      date.textContent = `Date: ${booking.date || "Not provided"}`;

      const time = document.createElement("p");
      time.textContent = `Time: ${booking.time || "Not provided"}`;

      const status = document.createElement("p");
      status.textContent = `Status: ${booking.status || "Pending"}`;

      cardBody.appendChild(name);
      cardBody.appendChild(emailInfo);
      cardBody.appendChild(info);
      cardBody.appendChild(educationInfo);
      cardBody.appendChild(date);
      cardBody.appendChild(time);
      cardBody.appendChild(status);

      // Display confirmation link if booking is accepted
      if (booking.status === "Accepted") {

        const confirmationLink = document.createElement("a");

        confirmationLink.textContent = "View Confirmation";
        confirmationLink.href = `booking-confirmation.html?id=${doc.id}`;
        confirmationLink.className = "btn btn-success mt-2";

        cardBody.appendChild(confirmationLink);
      }

      card.appendChild(cardBody);
      pastRequests.appendChild(card);
    });

  } catch (error) {
    console.error("Error loading booking requests:", error);
    pastRequests.textContent = "Unable to load booking history.";
  }
}

// Load booking history when an email is entered
studentEmail.addEventListener("change", () => {
  const email = studentEmail.value.trim();

  if (email) {
    loadPastRequests(email);
  }
});

// Submit booking request
bookingForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Collect information from the booking form
  const bookingData = {
    studentInfo: studentInfo.value.trim(),
    education: education.value,
    studentName: studentName.value.trim(),
    email: studentEmail.value.trim(),
    date: bookingDate.value,
    time: bookingTime.value,
    status: "Pending"
  };

  try {
    // Save the booking request to Firestore
    await addDoc(collection(db, "bookingRequests"), bookingData);

    // Refresh the booking history
    await loadPastRequests(bookingData.email);

    // Hide the booking form
    bookingFormSection.hidden = true;

    // Show the Request Status screen
    requestStatusSection.hidden = false;

  } catch (error) {
    console.error("Error submitting booking request:", error);

    showMessage(
      "Something went wrong. Please try again.",
      "danger"
    );
  }
});
