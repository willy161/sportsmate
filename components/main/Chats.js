import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, getDoc, query, orderBy } from 'firebase/firestore';
import { app } from '../auth/firebaseConfig';

export default function Chats({ navigation }) {
  const [chats, setChats] = useState([]);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const messagesRef = collection(db, 'messages');
  const userUid = auth.currentUser.uid;

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    let chats = [];
    let seenUserIds = new Set(); // To keep track of users whose messages have been added
  
    const q = query(messagesRef, orderBy('createdAt', 'desc')); // Order by timestamp in descending order to get the latest messages first
    const querySnapshot = await getDocs(q);
  
    for (let doc of querySnapshot.docs) {
      let chat = doc.data();
      let otherUid = chat.userCombo.split('-').find(id => id !== userUid); // Get the other user's id
      
      // Only include the latest message from each user, and exclude messages where the uid of the doc is the current user's uid
      if (chat.userCombo && chat.userCombo.includes(userUid) && !seenUserIds.has(otherUid) && chat.uid !== userUid) {
        chat.id = doc.id;
        chat.userIds = chat.userCombo.split('-');  // split the userCombo into an array of userIds
        chats.push(chat);
        seenUserIds.add(otherUid); // Mark this user as seen
      }
    }
  
    setChats(chats);
  };
  

  return (
    <View style={styles.container}>
      {chats.length === 0 ? (
        <Text style={styles.emptyText}>No chats yet</Text>
      ) : (
        <FlatList
          data={chats}
          renderItem={({ item }) => {
            let otherUid = item.userIds.find(id => id !== userUid); // Get the other user's id
            return (
              <View style={styles.chatContainer}>
                <Text style={styles.chatText}>{item.userName || 'No users'}</Text>
                <Button title="Open Chat" onPress={() => navigation.navigate('Chat', { uid: item.uid })} />
              </View>
            );
          }}
          keyExtractor={item => item.id}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  emptyText: {
    fontSize: 18,
    alignSelf: 'center',
    marginVertical: 50,
  },
  chatContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  chatText: {
    fontSize: 18,
  },
});
