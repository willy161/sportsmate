import React, { useState } from 'react';
import { Button, TextInput, View, StyleSheet } from 'react-native';
import { app } from '../auth/firebaseConfig';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getUserLocation } from '../../redux/actions/index';

export default function Add() {
  const [caption, setCaption] = useState('');
  const [participants, setParticipants] = useState('');

  const onAddPost = async () => {
    const location = await getUserLocation();

    const db = getFirestore(app);
    const auth = getAuth(app);
    const postRef = collection(db, 'posts', auth.currentUser.uid, 'userPosts');

    await addDoc(postRef, {
      caption,
      participants: parseInt(participants),
      location,
      creation: serverTimestamp(),
    });

    // clear the fields
    setCaption('');
    setParticipants('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Caption"
        style={styles.input}
        value={caption}
        onChangeText={setCaption}
      />
      <TextInput
        placeholder="Number of participants"
        style={styles.input}
        value={participants}
        onChangeText={setParticipants}
        keyboardType="numeric"
      />
      <Button title="Add Post" onPress={onAddPost} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingLeft: 10,
    marginBottom: 10,
  },
});
