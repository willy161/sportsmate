import { View, Text, FlatList, TouchableOpacity, Button, StyleSheet, Modal} from 'react-native';
import { getFirestore, collection, getDocs, orderBy, query } from 'firebase/firestore';
import {Picker} from '@react-native-picker/picker';
import { app } from '../auth/firebaseConfig';
import { useIsFocused } from '@react-navigation/native';
import { getUserLocation, calculateDistance } from '../../redux/actions/index';
import { useEffect, useState } from 'react';

export default function Feed({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(100); // Default distance filter is 100 km
  const [showPicker, setShowPicker] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchPosts = async () => {
      const location = await getUserLocation();
      setUserLocation(location);

      const db = getFirestore(app);
      const postRef = collection(db, 'posts');
      const postSnap = await getDocs(postRef);

      let allPosts = [];
      for (const doc of postSnap.docs) {
        const userPostsRef = collection(postRef, doc.id, 'userPosts');
        const userPostsSnap = await getDocs(userPostsRef);
        userPostsSnap.docs.forEach(post => {
          const postData = post.data();
          const postDistance = calculateDistance(
            postData.location.latitude,
            postData.location.longitude,
            location.latitude,
            location.longitude
          );
          if (postDistance <= distance) {
            allPosts.push({
              id: post.id,
              uid: doc.id,
              ...postData,
              distance: postDistance,
            });
          }
        });
      }

      allPosts.sort((a, b) => b.createdAt - a.createdAt); // sort in descending order
      setPosts(allPosts);
    };

    fetchPosts();
  }, [isFocused, distance]);

  const renderItem = ({ item }) => (
    <View style={styles.postContainer}>
      <Text>{item.caption}</Text>
      <Text>Location: {item.location.latitude}, {item.location.longitude}</Text>
      <Button title="Chat" onPress={() => navigation.navigate('Chat', { uid: item.uid })} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Feed</Text>
        <Button title="Select Distance" onPress={() => setShowPicker(true)} />
        <Modal visible={showPicker} onRequestClose={() => setShowPicker(false)}>
          <Picker
            selectedValue={distance}
            style={{ height: 50, width: 150 }}
            onValueChange={(itemValue, itemIndex) => setDistance(itemValue)}
          >
            <Picker.Item label="50 km" value={50} />
            <Picker.Item label="100 km" value={100} />
            <Picker.Item label="150 km" value={150} />
            <Picker.Item label="200 km" value={200} />
          </Picker>
          <Button title="Close" onPress={() => setShowPicker(false)} />
        </Modal>
      </View>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        onRefresh={() => setPosts([])}
        refreshing={posts.length === 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  postContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
});