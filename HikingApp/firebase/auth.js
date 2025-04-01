import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import { doc, setDoc, } from 'firebase/firestore'

export const registerUser = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "user", user.uid), {
            uid: user.uid,
            email: user.email,
        });

        return user;
    } catch (error) {
        console.error("Error signing up: ", error);
        throw error;
    }
};

export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error("Error logging in: ", error);
        throw error;
    }
};

export const logoutUser = async () => {
    try {
        await signOut(auth);
        console.log("User logged out");
    } catch (error) {
        console.error("Error logging out: ", error);
        throw error;
    }
};

export const authStateListener = (callback) => {
    return onAuthStateChanged(auth, callback);
};