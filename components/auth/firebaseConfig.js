import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAXTh32MG_KBkz0CJNJzJk2y748XFpQTGc",
  authDomain: "sportsmate-21006.firebaseapp.com",
  projectId: "sportsmate-21006",
  storageBucket: "sportsmate-21006.appspot.com",
  messagingSenderId: "411877771192",
  appId: "1:411877771192:web:81b2c2e41a0bfaf4a9314d",
  measurementId: "G-ED73N504HZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const db = getFirestore(app);

export { app, database, db };
