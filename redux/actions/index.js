import { USER_STATE_CHANGE } from "../constants/index";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../../components/auth/firebaseConfig";

export function fetchUser() {
  return (dispatch) => {
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    const userDocRef = doc(firestore, "users", auth.currentUser.uid);

    onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        console.log(snapshot.data());
        dispatch({ type: USER_STATE_CHANGE, currentUser: snapshot.data() });
      } else {
        console.log("does not exist");
      }
    }, (error) => {
      console.error("Error fetching user data: ", error);
    });
  };
}
