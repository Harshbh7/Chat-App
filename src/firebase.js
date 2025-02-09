// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import firebase from "firebase/compat/app";
import { getDatabase, ref, push, onValue } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

// Save image URL to Firestore
export const saveImageURL = async (url) => {
  try {
    const docRef = doc(db, "images", new Date().toISOString());
    await setDoc(docRef, { imageUrl: url });
    console.log("Image URL saved to Firestore.");
  } catch (error) {
    console.error("Error saving image URL to Firestore:", error);
    throw error;
  }
};

// Fetch all image URLs from Firestore
export const fetchImages = async () => {
  try {
    const imagesCollection = collection(db, "images");
    const snapshot = await getDocs(imagesCollection);
    return snapshot.docs.map((doc) => doc.data().imageUrl);
  } catch (error) {
    console.error("Error fetching images:", error);
    throw error;
  }
};

export { auth, database, storage, ref, push, onValue};
