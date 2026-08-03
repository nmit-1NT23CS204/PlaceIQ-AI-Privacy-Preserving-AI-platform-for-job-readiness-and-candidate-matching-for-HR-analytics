import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "placeiq-2026-669b7fee",
  appId: "1:751384002132:web:5918bfe4e77a186499f7c1",
  storageBucket: "placeiq-2026-669b7fee.firebasestorage.app",
  apiKey: "AIzaSyClPFljdR1E7RmVifxABkXfEtlla39qHA0",
  authDomain: "placeiq-2026-669b7fee.firebaseapp.com",
  messagingSenderId: "751384002132"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
