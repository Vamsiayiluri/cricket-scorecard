const getEnv = (key, fallback = "") => {
  const value = import.meta.env[key];
  return value ?? fallback;
};

export const firebaseEnv = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY", "AIzaSyDOLxUAzhPGpeXZXdIre9Ev-8MZcUTyp1o"),
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN", "cricket-scorecard-eebd2.firebaseapp.com"),
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID", "cricket-scorecard-eebd2"),
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET", "cricket-scorecard-eebd2.firebasestorage.app"),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID", "373838695580"),
  appId: getEnv("VITE_FIREBASE_APP_ID", "1:373838695580:web:aaeb6d77553813aec9b159"),
  measurementId: getEnv("VITE_FIREBASE_MEASUREMENT_ID", "G-J2Z4B4WEHS"),
};

