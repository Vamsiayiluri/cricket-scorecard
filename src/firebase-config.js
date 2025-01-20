import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDOLxUAzhPGpeXZXdIre9Ev-8MZcUTyp1o",
  authDomain: "cricket-scorecard-eebd2.firebaseapp.com",
  projectId: "cricket-scorecard-eebd2",
  storageBucket: "cricket-scorecard-eebd2.firebasestorage.app",
  messagingSenderId: "373838695580",
  appId: "1:373838695580:web:aaeb6d77553813aec9b159",
  measurementId: "G-J2Z4B4WEHS",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export default db;
