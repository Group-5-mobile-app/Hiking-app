import { auth } from "../firebase/firebaseConfig";
import { deleteDocument } from "../firebase/firestore";

const deleteUser = async () => {
  await deleteDocument("user", auth.currentUser.uid);
  await auth.currentUser.delete();
};

export default deleteUser;