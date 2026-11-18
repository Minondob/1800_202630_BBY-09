
import { db } from "./firebaseConfig.js";
import {
    collection,
    getDocs,
    doc,
    updateDoc,
    query,
    where
} from "firebase/firestore";

// Get the page elements
const bookingRequests = document.getElementById("booking-requests");
const inboxMessage = document.getElementById("inbox-message");

// Display messages
function showMessage(message, type) {
    inboxMessage.textContent = message;
    inboxMessage.className = `alert alert-${type}`;
}

// Load pending booking requests from Firestore
async function loadBookingRequests() {

    try {

        // Get the booking requests collection
        const bookingRef = collection(db, "bookingRequests");

        // Find requests with Pending status
        const q = query(
            bookingRef,
            where("status", "==", "Pending")
        );

        // Get the matching documents
        const querySnapshot = await getDocs(q);

        // Clear the previous requests
        bookingRequests.innerHTML = "";

        // Check if there are any pending requests
        if (querySnapshot.empty) {
            bookingRequests.textContent = "No new booking requests.";
            return;
        }

        // Display each booking request
        querySnapshot.forEach((bookingDoc) => {

            const booking = bookingDoc.data();

            // Create a card for the request
            const card = document.createElement("div");
            card.className = "request-card";

            // Display student name
            const name = document.createElement("h4");
            name.className = "request-name";
            name.textContent = booking.studentName || "Student";

            // Create the details section
            const details = document.createElement("div");
            details.className = "request-details";

            // Display student email
            const email = document.createElement("p");
            email.textContent = `Email: ${booking.email || "Not provided"}`;

            // Display education level
            const education = document.createElement("p");
            education.textContent = `Education: ${booking.education || "Not provided"}`;

            // Display learning requirements
            const info = document.createElement("p");
            info.textContent = `Learning Requirements: ${booking.studentInfo || "Not provided"}`;

            // Display requested date
            const date = document.createElement("p");
            date.textContent = `Requested Date: ${booking.date || "Not provided"}`;

            // Add details to the section
            details.appendChild(email);
            details.appendChild(education);
            details.appendChild(info);
            details.appendChild(date);

            // Create Accept button
            const acceptButton = document.createElement("button");
            acceptButton.textContent = "Accept";
            acceptButton.className = "tm-button accept-button me-2";

            acceptButton.addEventListener("click", function () {
                updateBookingStatus(bookingDoc.id, "Accepted");
            });

            // Create Decline button
            const declineButton = document.createElement("button");
            declineButton.textContent = "Decline";
            declineButton.className = "tm-button decline-button";

            declineButton.addEventListener("click", function () {
                updateBookingStatus(bookingDoc.id, "Declined");
            });

            // Add everything to the request card
            card.appendChild(name);
            card.appendChild(details);
            card.appendChild(acceptButton);
            card.appendChild(declineButton);

            // Display the card on the page
            bookingRequests.appendChild(card);
        });

    } catch (error) {

        console.error("Error loading booking requests:", error);

        showMessage(
            "Unable to load booking requests. Please try again.",
            "danger"
        );
    }
}

// Update the booking request status
async function updateBookingStatus(bookingId, newStatus) {

    try {

        // Find the selected booking document
        const bookingRef = doc(db, "bookingRequests", bookingId);

        // Update its status
        await updateDoc(bookingRef, {
            status: newStatus
        });

        showMessage(
            `Booking request ${newStatus.toLowerCase()} successfully!`,
            "success"
        );

        // Reload the inbox
        await loadBookingRequests();

    } catch (error) {

        console.error("Error updating booking status:", error);

        showMessage(
            "Unable to update booking status. Please try again.",
            "danger"
        );
    }
}

// Load booking requests when the page opens
loadBookingRequests();
