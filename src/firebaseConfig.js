
// src/firebaseAPIConfig.js
// -------------------------------------------------------------
// Part of the COMP1800 Project 1 Course.
// Handles Firebase initialization and exports the Auth and
// Firestore instances.
// Configuration values are loaded from Vite environment
// variables (.env file in the project root).
// -------------------------------------------------------------

// Import Firebase SDK modules (Firebase v9 modular syntax)
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ---------------------------------------------------------
// Read Firebase configuration from Vite environment variables.
// These values are defined in your .env file.
//
// VITE_FIREBASE_API_KEY=your-api-key
// VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
// VITE_FIREBASE_PROJECT_ID=your-project-id
// VITE_FIREBASE_APP_ID=your-app-id
//
// Note: Vite only exposes environment variables that start
// with "VITE_".
// ---------------------------------------------------------

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// ---------------------------------------------------------
// Initialize the Firebase app instance.
// This establishes the Firebase connection for your web app.
// ---------------------------------------------------------

const app = initializeApp(firebaseConfig);

// ---------------------------------------------------------
// Create and export the Firebase Authentication service.
// Import "auth" wherever you need to perform login,
// signup, or signout operations.
// ---------------------------------------------------------

export const auth = getAuth(app);

// ---------------------------------------------------------
// Initialize and export the Cloud Firestore database service.
// Import "db" wherever you need to read, write, or manage
// application data in Firestore.
// ---------------------------------------------------------

export const db = getFirestore(app);
