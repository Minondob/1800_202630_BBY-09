
import { db } from "./firebaseConfig.js";
import { collection, addDoc } from "firebase/firestore";

// Get the card details form
const form = document.getElementById("cardDetailsForm");

if (!form) {
    console.error("Card details form not found.");
} else {

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

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

            // Save payment record to Firestore
            const paymentRef = await addDoc(
                collection(db, "Payments"),
                {
                    cardholderName: cardholderName,
                    lastFourDigits: cardNumber.slice(-4),
                    paymentMethod: "card",
                    status: "pending"
                }
            );

            console.log("Payment saved:", paymentRef.id);

            alert("Payment information saved successfully!");

            form.reset();

        } catch (error) {

            console.error("Error saving payment:", error);

            alert("Unable to save payment information.");

        }
    });
}
