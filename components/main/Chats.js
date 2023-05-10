import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from '../auth/firebaseConfig';

export default function Chats({ navigation }) {
  const [chats, setChats] = useState([]);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const chatsRef = collection(db, 'messages');

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    const q = query(messageRef, 
        where('userCombo', '==', userCombo), 
        orderBy('createdAt'), 
        limit(25));
    const querySnapshot = await getDocs(q);

    let chats = [];
    querySnapshot.forEach((doc) => {
      let chat = doc.data();
      chat.id = doc.id;  // Save the doc id
      chats.push(chat);
    });

    setChats(chats);
  };

  return (
    <View style={styles.container}>
      {chats.length === 0 ? (
        <Text style={styles.emptyText}>No chats yet</Text>
      ) : (
        <FlatList
          data={chats}
          renderItem={({ item }) => (
            <View style={styles.chatContainer}>
              <Text style={styles.chatText}>{item.userIds.join(', ')}</Text>
              <Button title="Open Chat" onPress={() => navigation.navigate('Chat', { uid: item.id })} />
            </View>
          )}
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
