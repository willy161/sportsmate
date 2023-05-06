import { USER_STATE_CHANGE, USER_POSTS_STATE_CHANGE } from "../constants/index";
import { getFirestore, doc, onSnapshot, collection, query, orderBy } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../../components/auth/firebaseConfig";

export function fetchUser() {
  return ((dispatch) => {
    console.log("fetchUser is called");
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
  });
}

export function fetchUserPosts() {
  return (dispatch) => {
    console.log('fetchUserPosts is called');
    const auth = getAuth(app);
    const firestore = getFirestore(app);

    const userPostsQuery = query(
      collection(firestore, 'posts', auth.currentUser.uid, 'userPosts'),
      orderBy('creation', 'asc')
    );

    onSnapshot(userPostsQuery, (snapshot) => {
      let posts = snapshot.docs.map((doc) => {
        const data = doc.data();
        const id = doc.id;
        return { id, ...data };
      });
      console.log(posts);
      dispatch({ type: USER_POSTS_STATE_CHANGE, posts });
    }, (error) => {
      console.error('Error fetching user posts: ', error);
    });
  };
}
