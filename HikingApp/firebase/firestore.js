import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore'

export const saveRoute = async (user_id, routeData) => {
    try {
        const routeRef = collection(db, `user/${user_id}/saved/routes`);
        const docRef = await addDoc(routeRef, routeData);
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
        console.error("error fetshing routes: ", error);
        throw error;
    }
};

export const savePath = async (user_id, pathData) => {
    try {
        const pathRef = collection(db, `user/${user_id}/saved/paths`);
        const docRef = await addDoc(pathRef, pathData);
        return docRef.id;
    } catch (error) {
        console.error("Error saving path: ", error);
        throw error;
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