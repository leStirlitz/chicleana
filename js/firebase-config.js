// Firebase configuration for Chicleana
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js';

const firebaseConfig = {
    apiKey: "AIzaSyCmjoLEbko7ILvhlJdMz-gqmAHJvJkw2O0",
    authDomain: "chicleana.firebaseapp.com",
    projectId: "chicleana",
    storageBucket: "chicleana.firebasestorage.app",
    messagingSenderId: "505940611499",
    appId: "1:505940611499:web:262201f04e884453b2c2ee",
    measurementId: "G-LR4NL3WKQT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
