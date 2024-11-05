import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDe0bQ8NLza6F0qDJ6otl7Sdjp8kTrzQAY",
  authDomain: "poplo-d78d8.firebaseapp.com",
  projectId: "poplo-d78d8",
  storageBucket: "poplo-d78d8.appspot.com",
  messagingSenderId: "567194078432",
  appId: "1:567194078432:web:779e684cb44f057ca11485",
  measurementId: "G-TVB2H4J5JL"
};


// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

console.log(app);
console.log(db);
console.log();

