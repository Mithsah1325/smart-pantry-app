// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore" //import firebase dab



const firebaseConfig = {
  apiKey: "AIzaSyARUD2l653ZVu1ogJRFqSO3I7xTaHcPa0k",
  authDomain: "inventory-22fdc.firebaseapp.com",
  projectId: "inventory-22fdc",
  storageBucket: "inventory-22fdc.appspot.com",
  messagingSenderId: "603524202349",
  appId: "1:603524202349:web:04eeabfaf8a9fa5744e464",
  measurementId: "G-PZ64K7FJMR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export { firestore };