import { getAuth } from 'firebase/auth';
import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, doc, setDoc, updateDoc, deleteDoc, Firestore, serverTimestamp } from 'firebase/firestore'

export const saveRoute = async (user_id, routeData) => {
    try {
        const routeRef = collection(db, `user/${user_id}/saved/routes`);
        const docRef = await addDoc(routeRef, {
            ...routeData,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error saving route: ", error);
        throw error;
    }
};

export const getUserRoutes = async (user_id) => {
    try {
        const routesRef = collection(db, `user/${user_id}/saved/routes`);
        const querySnapshot = await getDocs(routesRef);
        return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("error fetching routes: ", error);
        throw error;
    }
};

export const savePath = async (name, length) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) throw new Error("Kirjaudu sisään luodaksesi reittejä.");

    try {
        const pathRef = collection(firestore, `user/${user.uid}/saved/paths`);
        await addDoc(pathRef, {
            name,
            length,
            createdAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error("Error saving path: ", error);
        return false;
    }
};

export const getUserPaths = async (user_id) => {
    try {
        const pathsRef = collection(db, `user/ ${user_id}/saved/paths`);
        const querySnapshot = await getDocs(pathsRef);
        return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching paths: ", error);
        throw error;
    }
};

export const updateDocument = async (path, docId, newData) => {
    try {
        const docRef = doc(db, path, docId);
        await updateDoc(docRef, newData);
        return true;
    } catch (error) {
        console.error("Error updating document: ", error);
        throw error;
    }
};

export const deleteDocument = async (path, docId) => {
    try {
        const docRef = doc(db, path, docId);
        await deleteDoc(docRef);
        return true;
    } catch (error) {
        console.error("Error deleting document: ", error);
        throw error;
    }
};