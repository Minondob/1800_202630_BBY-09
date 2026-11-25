
import { auth, db } from "./firebaseConfig.js";
import { onAuthStateChanged } from "firebase/auth";
import {
    collection,
    getDocs,
    doc,
    updateDoc
} from "firebase/firestore";

const list = document.getElementById("booking-requests");
const messageBox = document.getElementById("inbox-message");

let tutorUid = null;

// Display messages
function showMessage(text, type) {
    messageBox.textContent = text;
    messageBox.className = `alert alert-${type}`;
}

// Prevent text from being interpreted as HTML
function esc(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML.replace(/"/g, "&quot;");
}

// Create the booking request card
function requestHtml(id, r) {
    return `
        <div class="border rounded-4 p-3 mb-3">

            <h2 class="h6 fw-bold mb-2">
                ${esc(r.studentName || "Student")}
            </h2>

            <p class="mb-1 small text-secondary">
                ${esc(r.education || "")}
            </p>

            <p class="mb-1">
                ${esc(r.studentInfo || "")}
            </p>

            <p class="mb-3 small text-secondary">
                ${esc(r.date || "No date")}
                ${esc(r.time || "")}
            </p>

            <button
                type="button"
                class="btn btn-success rounded-pill me-2"
                data-id="${esc(id)}"
                data-action="Accepted">
                Accept
            </button>

            <button
                type="button"
                class="btn btn-outline-danger rounded-pill"
                data-id="${esc(id)}"
                data-action="Declined">
                Decline
            </button>

        </div>
    `;
}

// Load booking requests
async function loadRequests() {
    try {
        // TEMPORARY TEST:
        // Load all booking requests to check whether they appear.
        const snap = await getDocs(
            collection(db, "bookingRequests")
        );

        // Match pending status regardless of capitalization
        const pending = snap.docs.filter(
            (d) =>
                d.data().status?.toLowerCase() === "pending"
        );

        list.innerHTML = pending.length
            ? pending
                .map((d) => requestHtml(d.id, d.data()))
                .join("")
            : `<p class="text-secondary">No new requests.</p>`;

    } catch (error) {
        console.error("Error loading booking requests:", error);

        showMessage(
            "Couldn't load requests. Please try again.",
            "danger"
        );
    }
}

// Accept or decline a booking request
async function setStatus(id, status) {
    const update = {
        status: status
    };

    // Save a demo meeting link when accepted
    if (status === "Accepted") {
        update.meetingLink =
            `https://meet.example.com/session-${id.slice(0, 6)}`;
    }

    try {
        await updateDoc(
            doc(db, "bookingRequests", id),
            update
        );

        showMessage(
            `Request ${status.toLowerCase()}.`,
            "success"
        );

        await loadRequests();

    } catch (error) {
        console.error("Error updating request:", error);

        showMessage(
            "Couldn't update the request. Please try again.",
            "danger"
        );
    }
}

// Handle Accept and Decline button clicks
list.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-id]");

    if (button) {
        setStatus(
            button.dataset.id,
            button.dataset.action
        );
    }
});

// Check teacher authentication
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    tutorUid = user.uid;

    loadRequests();
});
