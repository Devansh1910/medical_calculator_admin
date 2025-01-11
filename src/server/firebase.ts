// firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAOL7BAIGd0XPb5K6YEo7Ttp9hL2FTEsBY",
  authDomain: "mymedicosupdated.firebaseapp.com",
  databaseURL:
    "https://mymedicosupdated-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mymedicosupdated",
  storageBucket: "mymedicosupdated.appspot.com",
  messagingSenderId: "968103235749",
  appId: "1:968103235749:web:e293aa3951f96fdeedbd4c",
  measurementId: "G-DSQQ2QFFKF",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db };
