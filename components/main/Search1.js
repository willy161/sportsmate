import React, { useState } from 'react';
import { View, TextInput, Text, FlatList, TouchableOpacity } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../auth/firebaseConfig';

export default function Search( props ) {
  const [users, setUsers] = useState([]);

  const fetchUsers = async (search) => {
    if (search) {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('name', '>=', search));
      const querySnapshot = await getDocs(q);

      let usersData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const id = doc.id;
        return { id, ...data };
      });

      setUsers(usersData);
    } else {
      setUsers([]);
    }
  };

  const renderItem = ({ item }) => (
    <View>
      <TouchableOpacity
        onPress={() => props.navigation.navigate("Profile", {uid: item.id})}>
      <Text>{item.name}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View>
      <TextInput
        placeholder="Search for users..."
        onChangeText={(text) => fetchUsers(text)}
      />
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}
