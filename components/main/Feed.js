import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { getFirestore, collection, getDocs, doc, query, orderBy, getDoc } from 'firebase/firestore';
import {Picker} from '@react-native-picker/picker';
import { app } from '../auth/firebaseConfig';
import { useIsFocused } from '@react-navigation/native';
import { getUserLocation, calculateDistance } from '../../redux/actions/index';
import { useEffect, useState } from 'react';
import moment from 'moment';
import { getAuth } from 'firebase/auth';

export default function Feed({ navigation }) {
  const auth = getAuth(app);
  const currentUser = auth.currentUser;
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
    
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userSports = userDoc.data().sports;
    
      const postsSnapshot = await getDocs(query(collection(db, 'posts'), orderBy('dateOfActivity', 'asc')));
      let postsPromises = postsSnapshot.docs.map(async (postDoc) => {
        let postDocData = postDoc.data();
        postDocData.id = postDoc.id; // Add id to document data
    
        const postLocation = postDocData.location;
        const postDistance = calculateDistance(location.latitude, location.longitude, postLocation.latitude, postLocation.longitude);
    
        if (postDistance <= distance && moment(postDocData.dateOfActivity).isAfter(moment()) && postDocData.uid !== currentUser.uid && userSports.includes(postDocData.sport)) {
          const userDoc = await getDoc(doc(db, 'users', postDocData.uid));
          postDocData.userName = userDoc.exists() ? userDoc.data().name : 'User not found';
          return postDocData;
        } else {
          return null;
        }
      });
    
      const postsArray = await Promise.all(postsPromises);
      setPosts(postsArray.filter(post => post !== null));  // Filter out null posts
    };
    
    fetchPosts();
  }, [isFocused, distance, currentUser.uid]);

  const renderItem = ({ item }) => (
    <View style={styles.postContainer}>
      <Text style={styles.postTitle}>{item.caption}</Text>
      <Text style={styles.postText}>Posted by: {item.userName}</Text>
      <Text style={styles.postText}>Number of participants: {item.participants}</Text>
      <Text style={styles.postText}>Date: {moment(item.dateOfActivity).format('DD-MM HH:mm')}</Text>
      <TouchableOpacity style={styles.opacityButton} onPress={() => navigation.navigate('Chat', { uid: item.uid })}>
        <Text style={styles.buttonText}>Chat</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Feed</Text>
        <TouchableOpacity style={styles.opacityButton} onPress={() => setShowPicker(true)}>
          <Text style={styles.buttonText}>Select Distance</Text>
        </TouchableOpacity>
        <Modal
          animationType="slide"
          transparent={true}
          visible={showPicker}
         
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
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
              <TouchableOpacity style={styles.opacityButton} onPress={() => setShowPicker(false)}>
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    backgroundColor: '#f8f8f8',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  postText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  }
});

