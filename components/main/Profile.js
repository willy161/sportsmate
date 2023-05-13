import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'; // Import Image
import { connect } from 'react-redux';
import { getUserLocation } from '../../redux/actions/index';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { app } from '../auth/firebaseConfig';

function Profile(props) {
  const { currentUser, posts } = props;
  const defaultPicture = "https://firebasestorage.googleapis.com/v0/b/sportsmate-21006.appspot.com/o/profile_pictures%2Ff10ff70a7155e5ab666bcdd1b45b726d.jpg?alt=media&token=68093b3e-70e8-4c96-b9ae-d5305f9982ce";


  const onLogout = () => {
    const auth = getAuth(app);
    signOut(auth);
  };

  useEffect(() => {
    const fetchUserLocation = async () => {
      const location = await getUserLocation();
      console.log('User location:', location);
    };

    fetchUserLocation();
  }, []);

  const selectProfilePicture = async () => {
    const auth = getAuth(app);
  const uid = auth.currentUser?.uid;
  console.log('Current user ID:', uid);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    if (!result.cancelled && result.uri) {
      console.log('Image selected:', result.uri);
      uploadImage(result.uri, uid)
        .then(() => {
          alert('Picture uploaded!');
        })
        .catch((error) => {
          alert(error);
        });
    } else {
      alert('No image selected or image uri is not available.');
    }
  };
  
  const uploadImage = async (uri, uid) => {
    console.log('user', uid);
    console.log(uri);
    if (!uri || !uid) {
      throw new Error('Required parameters are missing.');
    }
  
    const response = await fetch(uri);
    const blob = await response.blob();
  
    const storage = getStorage(app);
    let storageRef = ref(storage, 'profile_pictures/' + uid);
    await uploadBytes(storageRef, blob);
  
    const url = await getDownloadURL(storageRef);
    const db = getFirestore(app);
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      picture: url,
    });
  };
  return (
    <View style={styles.container}>
      <View style={styles.containerInfo}>
        <TouchableOpacity style={styles.opacityButtonLogout} onPress={onLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
        <Image
          source={{uri: currentUser.picture || defaultPicture}}
          style={styles.profileImage}
        />
        <Text style={styles.userInfo}>Name: {currentUser.name}</Text>
        <Text style={styles.userInfo}>Email: {currentUser.email}</Text>
        <TouchableOpacity style={styles.opacityButton} onPress={selectProfilePicture}>
          <Text style={styles.buttonText}>Change Profile Picture</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
  },
  containerInfo: {
    margin: 20,
  },
  userInfo: {
    fontSize: 18,
    marginBottom: 10,
  },
  opacityButton: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#841584',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center'
  },
  opacityButtonLogout: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'red',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'flex-end'
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 10
  }
});
  
const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
  posts: store.userState.posts,
});

export default connect(mapStateToProps, null)(Profile);
