// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyDu73pgLWiBVtZSKjtNi3r-hau7hxIDMaA",
  authDomain: "abundant-fruits.firebaseapp.com",
  projectId: "abundant-fruits",
  storageBucket: "abundant-fruits.firebasestorage.app",
  messagingSenderId: "931903419011",
  appId: "1:931903419011:web:f98d845582af125784a1b6",
  measurementId: "G-DQTCE0MVFL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { db };
