
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

const form = document.getElementById("tm-booking-form");
const message = document.getElementById("booking-message");
const pastRequests = document.getElementById("past-requests");

const studentInfo = document.getElementById("tm-student-info");
const education = document.getElementById("tm-education");
const studentName = document.getElementById("tm-student-name");
const studentEmail = document.getElementById("tm-student-email");
const bookingDate = document.getElementById("booking-date");
const bookingTime = document.getElementById("booking-time");

let currentUser = null;

// Read the selected tutor's ID from the URL
const params = new URLSearchParams(window.location.search);
const tutorId = params.get("tutor");

// Display messages
function showMessage(text, type = "info") {
    message.textContent = text;
    message.className = `alert alert-${type}`;
}

// Load the student's past booking requests
async function loadPastRequests(user) {
    try {
        const requestsQuery = query(
            collection(db, "bookingRequests"),
            where("uid", "==", user.uid)
        );

        const querySnapshot = await getDocs(requestsQuery);

        const requests = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));

        requests.sort((a, b) => {
            const aTime = a.createdAt?.toMillis?.() || 0;
            const bTime = b.createdAt?.toMillis?.() || 0;

            return bTime - aTime;
        });

        pastRequests.innerHTML = requests.length
            ? requests.map((booking) => {
                const status = booking.status || "Pending";

                let payButton = "";

                if (status.toLowerCase() === "accepted") {
                    payButton = `
                        <a
                            class="btn btn-primary rounded-pill mt-2"
                            href="payment.html?bookingId=${encodeURIComponent(booking.id)}">
                            Pay now
                        </a>
                    `;
                }

                return `
                    <div class="border rounded-4 p-3 mb-3">
                        <h3 class="h6 fw-bold">
                            ${booking.studentName || "Booking request"}
                        </h3>

                        <p class="mb-1">
                            Date: ${booking.date || "Not available"}
                        </p>

                        <p class="mb-1">
                            Time: ${booking.time || "Not available"}
                        </p>

                        <p class="mb-1">
                            Status: ${status}
                        </p>

                        ${payButton}
                    </div>
                `;
            }).join("")
            : `<p class="text-secondary">No past requests.</p>`;

    } catch (error) {
        console.error("Error loading past requests:", error);

        pastRequests.textContent =
            "Unable to load past booking requests.";
    }
}

// Submit a booking request
if (form) {
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!currentUser) {
            showMessage("Please log in first.", "danger");
            return;
        }

        if (!bookingDate.value || !bookingTime.value) {
            showMessage(
                "Please select a booking date and time.",
                "warning"
            );
            return;
        }

        if (!tutorId) {
            showMessage(
                "Selected tutor information is missing.",
                "danger"
            );
            return;
        }

        const bookingData = {
            studentInfo: studentInfo.value.trim(),
            education: education.value,
            studentName: studentName.value.trim(),
            date: bookingDate.value,
            time: bookingTime.value,
            tutorId: tutorId,
            uid: currentUser.uid,
            email: currentUser.email,
            status: "Pending",
            createdAt: serverTimestamp()
        };

        try {
            // Create the booking document in Firestore
            const bookingRef = await addDoc(
                collection(db, "bookingRequests"),
                bookingData
            );

            // Firestore-generated booking document ID
            const bookingId = bookingRef.id;

            console.log("Booking created:", bookingId);

            showMessage(
                "Booking request submitted successfully!",
                "success"
            );

            form.reset();

            // Restore the student's email
            studentEmail.value = currentUser.email || "";

            // Reload past requests
            await loadPastRequests(currentUser);

        } catch (error) {
            console.error("Error submitting booking:", error);

            showMessage(
                "Unable to submit booking request.",
                "danger"
            );
        }
    });
}

// Check student authentication
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    currentUser = user;

    if (studentEmail) {
        studentEmail.value = user.email || "";
    }

    await loadPastRequests(user);
});
