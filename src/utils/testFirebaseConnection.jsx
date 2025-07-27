// src/utils/testFirebaseConnection.jsx

import { auth, db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";

export const testFirebaseConnection = async () => {
  try {
    console.log("🔍 Testing Firebase connection...");
    
    // Check if environment variables are loaded
    console.log("📋 Environment Variables Check:");
    console.log("API Key exists:", !!import.meta.env.VITE_FIREBASE_API_KEY);
    console.log("Auth Domain exists:", !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
    console.log("Project ID exists:", !!import.meta.env.VITE_FIREBASE_PROJECT_ID);
    console.log("Storage Bucket exists:", !!import.meta.env.VITE_FIREBASE_STORAGE_BUCKET);
    console.log("Messaging Sender ID exists:", !!import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID);
    console.log("App ID exists:", !!import.meta.env.VITE_FIREBASE_APP_ID);
    
    // Test Firestore connection
    const testDocRef = doc(db, 'test', 'connection-test');
    const testDoc = await getDoc(testDocRef);
    console.log("✅ Firestore connection successful");
    
    // Test Auth connection
    const currentUser = auth.currentUser;
    console.log("✅ Auth connection successful");
    console.log("Current user:", currentUser ? "Logged in" : "Not logged in");
    
  } catch (error) {
    console.error("❌ Firebase connection failed:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    
    if (error.code === 'auth/configuration-not-found') {
      console.error("🔧 This error usually means:");
      console.error("1. Firebase Authentication is not enabled in your Firebase project");
      console.error("2. Email/Password authentication method is not enabled");
      console.error("3. Environment variables are not properly set");
      console.error("4. Firebase project configuration is incorrect");
    }
  }
};
