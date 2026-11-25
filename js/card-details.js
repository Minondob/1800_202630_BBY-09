
import { db } from "./firebaseConfig.js";
import { collection, addDoc } from "firebase/firestore";

// Get the booking ID from the Cardpay URL
const params = new URLSearchParams(window.location.search);
const bookingId = params.get("bookingId");

console.log("Booking ID on Cardpay:", bookingId);

// Get the card details form
const form = document.getElementById("cardDetailsForm");

if (!form) {
    console.error("Card details form not found.");
} else {

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        // Check whether the booking ID exists
        if (!bookingId) {
            alert("Booking ID is missing. Please return to your booking.");
            return;
        }

        // Get cardholder information
        const cardholderName = document
            .getElementById("cardholderName")
            .value.trim();

        const cardNumber = document
            .getElementById("cardNumber")
            .value.trim();

        // Validate information
        if (!cardholderName || !cardNumber) {
            alert("Please enter the required information.");
            return;
        }

        try {

            // Save mock payment record to Firestore
            const paymentRef = await addDoc(
                collection(db, "Payments"),
                {
                    cardholderName: cardholderName,
                    lastFourDigits: cardNumber.slice(-4),
                    paymentMethod: "card",
                    status: "paid"
                }
            );

            console.log("Payment saved:", paymentRef.id);

            alert("Mock payment successful!");

            // Move to the connection page and preserve booking ID
            window.location.href =
                `connection.html?bookingId=${encodeURIComponent(bookingId)}`;

        } catch (error) {

            console.error("Error saving payment:", error);

            alert("Unable to save payment information.");

        }
    });
}
