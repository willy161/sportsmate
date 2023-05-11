import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button, StyleSheet, Modal, Alert } from 'react-native';
import { getFirestore, collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { app } from '../auth/firebaseConfig';
import { useIsFocused } from '@react-navigation/native';
import { getUserLocation, calculateDistance } from '../../redux/actions/index';
import NetInfo from '@react-native-community/netinfo';
import {Picker} from '@react-native-picker/picker';

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
      const postQuery = query(postRef, orderBy('creation', 'desc'));

      const postSnap = await getDocs(postQuery);
      let allPosts = [];

      postSnap.docs.forEach(doc => {
        const postData = doc.data();
        const postDistance = calculateDistance(
          postData.location.latitude,
          postData.location.longitude,
          location.latitude,
          location.longitude
        );
        if (postDistance <= distance) {
          allPosts.push({
            id: doc.id,
            ...postData,
            distance: postDistance,
          });
        }
      });

      setPosts(allPosts);
    };

    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        fetchPosts();
      } else {
        Alert.alert('No Internet Connection', 'Please check your internet connection and try again.');
      }
    });
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
    fontSize: 21,
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

