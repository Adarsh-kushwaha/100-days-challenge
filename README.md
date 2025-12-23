// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCJrK7lDrJsoi9S8KPlRoBdSbaVb3fkHs0",
  authDomain: "dayschallenge-7d35e.firebaseapp.com",
  projectId: "dayschallenge-7d35e",
  storageBucket: "dayschallenge-7d35e.firebasestorage.app",
  messagingSenderId: "148133867688",
  appId: "1:148133867688:web:5a220cb08b9d213f19d29d",
  measurementId: "G-7PWP19HV1W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);