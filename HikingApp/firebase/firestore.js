import { getAuth } from 'firebase/auth';
import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, doc, setDoc, updateDoc, deleteDoc, firestore, serverTimestamp, query, orderBy } from 'firebase/firestore'

//Here the route data needs to be replaced with what is needed to be saved
export const saveRoute = async (routeData) => {
    const auth = getAuth();
    const user = auth.currentUser;
    try {
        const routeRef = collection(db, `user/${user.uid}/routes`);
        await addDoc(routeRef, {
            ...routeData,
            createdAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error("Error saving route: ", error);
        return false;
    }
};

export const getUserRoutes = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    try {
        const routesRef = collection(db, `user/${user.uid}/routes`);
        const querySnapshot = await getDocs(routesRef);
        return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("error fetching routes: ", error);
        throw error;
    }
};

export const savePath = async (name, length, routePath) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) throw new Error("Kirjaudu sisään luodaksesi reittejä.");

    try {
        const pathRef = collection(db, `user/${user.uid}/paths`);

        await addDoc(pathRef, {
            name,
            length,
            routePath,
            createdAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error("Error saving path: ", error);
        return false;
    }
};

export const getUserPaths = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) throw new Error("Kirjaudu sisään luodaksesi reittejä.");

    try {
        const pathsRef = collection(db, `user/${user.uid}/paths`);
        const q = query(pathsRef, orderBy("createdAt", "desc"));

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
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