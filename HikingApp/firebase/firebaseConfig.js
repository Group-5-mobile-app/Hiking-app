import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
//Also add a authentication method for login and export it

const firebaseConfig = {
    apiKey: "AIzaSyA08YLLOlYQo5T0XK2E7ML3iP9Kg3nlHVw",
    authDomain: "hiking-app-e63ef.firebaseapp.com",
    projectId: "hiking-app-e63ef",
    storageBucket: "hiking-app-e63ef.firebasestorage.app",
    messagingSenderId: "1081905446129",
    appId: "1:1081905446129:web:1c5e751ebef0e5b5ad3d50"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); 
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;