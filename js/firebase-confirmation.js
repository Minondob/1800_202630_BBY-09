
import { db } from "./firebaseConfig.js";

import {
    collection,
    getDocs
} from "firebase/firestore";

// Select the bookings collection
const bookingsRef = collection(db, "bookings");

// Retrieve booking history
async function loadBookingHistory() {

    try {
        const querySnapshot = await getDocs(bookingsRef);

        console.log("Booking history:", querySnapshot);

        querySnapshot.forEach((doc) => {
            console.log(doc.id, doc.data());
        });

    } catch (error) {
        console.error("Error loading booking history:", error);
    }
}

// Run the function
loadBookingHistory();
