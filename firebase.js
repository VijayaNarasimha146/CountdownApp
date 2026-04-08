import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD6dBj1iO3Kxu6M-QqIIaWnf-_hvPWS4_k",
  authDomain: "countdownapp-843c8.firebaseapp.com",
  projectId: "countdownapp-843c8",
  storageBucket: "countdownapp-843c8.firebasestorage.app",
  messagingSenderId: "677366909831",
  appId: "1:677366909831:web:3fe56d59fee5c93db3e122",
  measurementId: "G-LQN7DD6XSZ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const docRef = doc(db, "config", "targetDate");

export const saveDate = async (date) => {
  await setDoc(docRef, { date });
};

export const loadDate = async () => {
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data().date : null;
};
