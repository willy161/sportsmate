import { View, Text, FlatList, TextInput, Button, StyleSheet, Keyboard, Dimensions, Image } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, orderBy, limit, addDoc, getDocs, doc, getDoc } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { app } from '../auth/firebaseConfig';
import { useEffect, useState } from 'react';

function ChatMessage({ message, currentUid }) {
  const { text, uid, userName } = message;
  const messageAlignment = uid === currentUid ? 'flex-end' : 'flex-start';
  const bubbleColor = uid === currentUid ? '#147efb' : '#eee';

  return (
    <View style={[styles.messageBubble, { alignSelf: messageAlignment, backgroundColor: bubbleColor }]}>
      <Text style={styles.username}>{userName}</Text>
      <Text>{text}</Text>
    </View>
  );
}

export default function Chat({ route }) {
  const [inputText, setInputText] = useState('');
  const [currentUsername, setCurrentUsername] = useState('');
  const [otherUsername, setOtherUsername] = useState('');
  const [otherUserPicture, setOtherUserPicture] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const uid = route.params.uid; // the id of the other user
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
    const currentUserDocRef = doc(db, 'users', auth.currentUser.uid);
    const currentUserDocSnap = await getDoc(currentUserDocRef);
  
    if (currentUserDocSnap.exists()) {
      setCurrentUsername(currentUserDocSnap.data().name);
    }

    const otherUserDocRef = doc(db, 'users', uid);
    const otherUserDocSnap = await getDoc(otherUserDocRef);
  
    if (otherUserDocSnap.exists()) {
      setOtherUsername(otherUserDocSnap.data().name);
      setOtherUserPicture(otherUserDocSnap.data().picture || "https://firebasestorage.googleapis.com/v0/b/sportsmate-21006.appspot.com/o/profile_pictures%2Ff10ff70a7155e5ab666bcdd1b45b726d.jpg?alt=media&token=68093b3e-70e8-4c96-b9ae-d5305f9982ce");
    }
  };

  const onSend = async () => {
    await addDoc(messageRef, {
      uid: auth.currentUser.uid,
      text: inputText,
      createdAt: Date.now(),
      userCombo: userCombo,
      userName: currentUsername
    });
    setInputText(''); // Clear the input field
  };

  return (
    <View style={[styles.container, { marginBottom: keyboardHeight }]}>
      <View style={styles.header}>
        <Image style={styles.profilePic} source={{ uri: otherUserPicture }} />
        <Text>{otherUsername}</Text>
      </View>
      <FlatList
        style={styles.messageList}
        data={messages}
        inverted={false} 
        renderItem={({ item }) => <ChatMessage key={item.id} message={item} currentUid={auth.currentUser.uid} />}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
  },
  username: {
    color: '#888',
    fontWeight: 'bold',
  },
});
