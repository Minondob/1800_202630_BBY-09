
import { db } from "./firebaseConfig.js";
import { doc, getDoc } from "firebase/firestore";

console.log("Connection.js is running");

// HTML elements
const zoomBtn = document.getElementById("zoomBtn");
const callBtn = document.getElementById("callBtn");

const infoMessage = document.querySelector(".phone-call-note");

const bookingDateElement = document.getElementById("booking-date");
const bookingTimeElement = document.getElementById("booking-time");

// Get booking ID from URL
const params = new URLSearchParams(window.location.search);
const bookingId = params.get("bookingId");

console.log("Booking ID:", bookingId);

async function loadConnectionDetails() {
    try {
        // Check whether booking ID exists
        if (!bookingId) {
            infoMessage.textContent =
                "Booking ID is missing from the URL.";

            console.error("No booking ID found in URL.");
            return;
        }

        // Retrieve booking document from Firestore
        const bookingRef = doc(db, "bookingRequests", bookingId);
        const bookingSnap = await getDoc(bookingRef);

        console.log("Document exists:", bookingSnap.exists());

        // Check whether document exists
        if (!bookingSnap.exists()) {
            infoMessage.textContent =
                "Booking request not found in Firestore.";

            console.error("Booking document was not found.");
            return;
        }

        // Get booking data
        const booking = bookingSnap.data();

        console.log("Booking data:", booking);

        // Display date and time
        bookingDateElement.textContent =
            booking.date || "Date not available";

        bookingTimeElement.textContent =
            booking.time || "Time not available";

        // Get meeting link from Firestore
        const meetingLink = booking.meetingLink || "";

        if (meetingLink) {
            zoomBtn.disabled = false;

            zoomBtn.addEventListener("click", function () {
                window.open(meetingLink, "_blank");
            });
        }

        infoMessage.textContent =
            "Your booking details have been loaded.";

    } catch (error) {
        console.error("Error loading booking:", error);

        infoMessage.textContent =
            "Unable to load booking details. Check the console.";
    }
}

loadConnectionDetails();
