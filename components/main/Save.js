import React, { useState } from 'react';
import { View, TextInput, Image, Button } from 'react-native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '../auth/firebaseConfig';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, doc, addDoc, serverTimestamp } from 'firebase/firestore';

export default function Save(props, { navigation }) {
  console.log(props.route.params.image);
  const auth = getAuth(app);
  const [caption, setCaption] = useState('');
  const childPath = `post/${auth.currentUser.uid}/${Math.random().toString(36)}`;
  console.log(childPath);
  const uploadImage = async () => {
    const uri = props.route.params.image;
    const response = await fetch(uri);
    const blob = await response.blob();
    const storage = getStorage(app);
    const storageRef = ref(storage, childPath);
    const task = uploadBytesResumable(storageRef, blob);

    const taskProgress = (snapshot) => {
      console.log(`transferred: ${snapshot.bytesTransferred}`);
    };

    const taskCompleted = () => {
      getDownloadURL(storageRef).then((url) => {
        savePostData(url);
        console.log(url);
      });
    };

    const taskError = (snapshot) => {
      console.log(snapshot);
    };

    task.on('state_changed', taskProgress, taskError, taskCompleted);
  };
  const savePostData = (downloadURL) => {
    const firestore = getFirestore(app);
    addDoc(collection(firestore, 'posts', auth.currentUser.uid, 'userPosts'), {
      downloadURL,
      caption,
      creation: serverTimestamp(),
    }).then(() => {
      props.navigation.popToTop();
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <Image source={{ uri: props.route.params.image }} />
      <TextInput
        placeholder="Write a caption . . ."
        onChangeText={(caption) => setCaption(caption)}
      />
      <Button title="Save" onPress={() => uploadImage()} />
    </View>
  );
}
