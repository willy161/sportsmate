import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
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
    let seenUserIds = new Set(); // Set, ki shrani že prikazane pogovore
  
    const q = query(messagesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
  
    for (let doc of querySnapshot.docs) {
      let chat = doc.data();
      let otherUid = chat.userCombo.split('-').find(id => id !== userUid); //dobi id sogovorca
      
      if (chat.userCombo && chat.userCombo.includes(userUid) && !seenUserIds.has(otherUid) && chat.uid !== userUid) {
        chat.id = doc.id;
        chat.userIds = chat.userCombo.split('-');  
        chats.push(chat);
        seenUserIds.add(otherUid); //označi viden govor
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
            let otherUid = item.userIds.find(id => id !== userUid); //najdi id drugega userja
            return (
              <View style={styles.chatContainer}>
                <Text style={styles.chatText}>{item.userName || 'No users'}</Text>
                <TouchableOpacity style={styles.opacityButton} onPress={() => navigation.navigate('Chat', { uid: otherUid })}>
                  <Text style={styles.buttonText}>Open Chat</Text>
                </TouchableOpacity>
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
  opacityButton: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#841584',
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold'
  },
});

