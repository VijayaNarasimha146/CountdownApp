import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
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
