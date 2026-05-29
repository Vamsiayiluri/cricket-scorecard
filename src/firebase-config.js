import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { firebaseEnv } from "./config/env";

const firebaseConfig = {
  apiKey: firebaseEnv.apiKey,
  authDomain: firebaseEnv.authDomain,
  projectId: firebaseEnv.projectId,
  storageBucket: firebaseEnv.storageBucket,
  messagingSenderId: firebaseEnv.messagingSenderId,
  appId: firebaseEnv.appId,
  measurementId: firebaseEnv.measurementId,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export default db;
