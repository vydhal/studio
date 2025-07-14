// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence, initializeFirestore } from "firebase/firestore";

// IMPORTANT: Replace with your own Firebase project configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "1:your-sender-id:web:your-app-id"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Initialize Firestore with offline persistence
let db;
try {
    db = initializeFirestore(app, {});
    if (typeof window !== 'undefined') {
        enableIndexedDbPersistence(db)
          .catch((err) => {
            if (err.code == 'failed-precondition') {
              // Multiple tabs open, persistence can only be enabled
              // in one tab at a time.
              console.warn('Firestore persistence failed: failed-precondition. Multiple tabs open?');
            } else if (err.code == 'unimplemented') {
              // The current browser does not support all of the
              // features required to enable persistence
               console.warn('Firestore persistence failed: unimplemented. Browser not supported?');
            }
          });
    }
} catch (e) {
    console.error("Could not initialize Firestore, this is expected in a test environment without real credentials.", e)
}


export { app, auth, db };
