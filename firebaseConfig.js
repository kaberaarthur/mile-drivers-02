import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD0kPJKSOU4qtXrvddyAZFHeXQY2LMrz_M",
  authDomain: "mile-cab-app.firebaseapp.com",
  projectId: "mile-cab-app",
  storageBucket: "mile-cab-app.appspot.com",
  messagingSenderId: "51746516421",
  appId: "1:51746516421:web:e77c88b9d209063446afac",
  measurementId: "G-763ZNR0FZZ",
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Use these for db & auth
const db = app.firestore();
const auth = firebase.auth();

export { auth, db };