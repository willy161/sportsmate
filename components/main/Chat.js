import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Button, StyleSheet, Keyboard, Dimensions } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, orderBy, limit, addDoc } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { app } from '../auth/firebaseConfig';

export default function Chat({ route }) {
  const [inputText, setInputText] = useState('');
  const [usernames, setUsernames] = useState({});
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const uid = route.params.uid;// the id of the other user
  const auth = getAuth(app);
  const db = getFirestore(app);
  const messageRef = collection(db, 'messages');
  const userCombo = [uid, auth.currentUser.uid].sort().join('-');

  const q = query(messageRef, 
    where('userCombo', '==', userCombo), 
    orderBy('createdAt'), 
    limit(25));
  const [messages] = useCollectionData(q, { idField: 'id' });

  useEffect(() => {
    fetchUsernames();

    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (event) => setKeyboardHeight(event.endCoordinates.height)
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const fetchUsernames = async () => {
    const docRef = collection(db, 'users');
    const docSnap = await getDocs(docRef);

    if (!docSnap.empty) {
      let usernames = {};
      docSnap.forEach(doc => {
        usernames[doc.id] = doc.data().name;
      });
      setUsernames(usernames);
    }
  };

  const onSend = async () => {
    await addDoc(messageRef, {
      uid: auth.currentUser.uid,
      text: inputText,
      createdAt: Date.now(),
      userCombo: userCombo
    });
    setInputText(''); // Clear the input field
  };

  return (
    <View style={[styles.container, { marginBottom: keyboardHeight }]}>
      <FlatList
        style={styles.messageList}
        data={messages}
        inverted={true} 
        renderItem={({ item }) => <ChatMessage message={item} currentUid={auth.currentUser.uid} usernames={usernames} />}
        keyExtractor={item => item.id}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message here..."
        />
        <Button title="Send" onPress={onSend} />
      </View>
    </View>
  );
}

function ChatMessage({ message, currentUid, usernames }) {
  const { text, uid } = message;
  const messageAlignment = uid === currentUid ? 'flex-end' : 'flex-start';
  const username = usernames[uid];

  return (
    <View style={[styles.messageBubble, { alignSelf: messageAlignment }]}>
      <Text>{username}</Text>
      <Text>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  messageList: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  messageBubble: {
    backgroundColor: '#eee',
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
  },
});
