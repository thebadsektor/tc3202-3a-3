// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCPXEv6KApAzWFEvkZUFZG8OU2TG7ZRrpY",
  authDomain: "seconsumptiontracker-d337e.firebaseapp.com",
  databaseURL: "https://seconsumptiontracker-d337e-default-rtdb.firebaseio.com",
  projectId: "seconsumptiontracker-d337e",
  storageBucket: "seconsumptiontracker-d337e.firebasestorage.app",
  messagingSenderId: "1002902321793",
  appId: "1:1002902321793:web:5ffad1e33f710fe319eb80",
  measurementId: "G-ETNESMMLVZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const database = getDatabase(app);
export default app;
