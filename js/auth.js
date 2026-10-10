// Auth component — registration, login, logout, state listener
import { auth, db } from './firebase-config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged as firebaseOnAuthStateChanged,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {
    doc,
    setDoc,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

/**
 * Register a new user with email, password, and display name.
 * Creates a Firestore profile document.
 */
export async function registerUser(email, password, displayName) {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const user = credential.user;

    // Set display name on Firebase Auth profile
    await updateProfile(user, { displayName });

    // Create Firestore user profile
    await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: email,
        displayName: displayName,
        createdAt: serverTimestamp(),
        totalReports: 0,
        totalCleanups: 0
    });

    return user;
}

/**
 * Log in with email and password.
 */
export async function loginUser(email, password) {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
}

/**
 * Log out the current user.
 */
export async function logoutUser() {
    await signOut(auth);
}

/**
 * Listen for auth state changes.
 */
export function onAuthStateChanged(callback) {
    return firebaseOnAuthStateChanged(auth, callback);
}

/**
 * Get current user or null.
 */
export function getCurrentUser() {
    return auth.currentUser;
}
