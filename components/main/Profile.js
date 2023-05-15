import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, RefreshControl } from 'react-native';
import { connect } from 'react-redux';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, updateDoc, collection, getDocs, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { app } from '../auth/firebaseConfig';
import { ScrollView } from 'react-native-gesture-handler';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Picker } from '@react-native-picker/picker';

function Profile(props) {
  const { currentUser } = props;
  const defaultPicture = "https://firebasestorage.googleapis.com/v0/b/sportsmate-21006.appspot.com/o/profile_pictures%2Ff10ff70a7155e5ab666bcdd1b45b726d.jpg?alt=media&token=68093b3e-70e8-4c96-b9ae-d5305f9982ce";
  const [selectedSport, setSelectedSport] = useState(null);
  const [sports, setSports] = useState([]);
  const [userSports, setUserSports] = useState([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [showSportPicker, setShowSportPicker] = useState(false);

  const uploadImage = async(uri, imageName) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storage = getStorage(app);
    const storageRef = ref(storage, `profile_pictures/${imageName}`);
    const uploadTask = uploadBytesResumable(storageRef, blob);
  
    uploadTask.on('state_changed', 
      (snapshot) => {
        // Handle progress, error, and success states here.
      }, 
      (error) => {
        console.log(error);
      }, 
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          const userRef = doc(db, 'users', userUid);
          updateDoc(userRef, {
            picture: downloadURL
          });
        });
      }
    );
  };

  const handleAddSport = () => {
    if (showSportPicker) {
      if (selectedSport) {
        onAddSport();
        setSelectedSport(null);
      }
      setShowSportPicker(false);
    } else {
      setShowSportPicker(true);
    }
  };

  const db = getFirestore(app);
  const auth = getAuth(app);
  const userUid = auth.currentUser.uid;

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchSports().then(fetchUserSports).then(() => setRefreshing(false));
  }, []);

  const fetchUserSports = async () => {
    const userRef = doc(db, 'users', userUid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists() && userDoc.data().sports) {
      const userFavouriteSportsIds = userDoc.data().sports || [];
      const userFavouriteSports = sports.filter(sport => userFavouriteSportsIds.includes(sport.id));
      setUserSports(userFavouriteSports);
    } else {
      setUserSports([]);  //Če sports ne obstaja nastavi na prazno
    }
};

  const fetchSports = async () => {
    const sportsRef = collection(db, 'sports');
    const snapshot = await getDocs(sportsRef);
    const sportsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); //dobi vse športe
    setSports(sportsList);
  };

  useEffect(() => {
    fetchSports().then(fetchUserSports);
  }, []);

  useEffect(() => {
    fetchSports();
    fetchUserSports(); //sproži funkcije športov
  }, []);

  const selectProfilePicture = async () => {
    const uid = auth.currentUser?.uid;
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],//sproži uporabnikovo galerijo, in omeji na 4:3 aspect ratio
      quality: 1,
    });

    if (!result.cancelled && result.uri) {
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

  const onAddSport = async () => {
    if (selectedSport) {
      const userRef = doc(db, 'users', userUid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userSports = userDoc.data().sports || [];
        if (userSports.includes(selectedSport)) {
          Alert.alert('You have already favourited this sport.'); //preveri če si že dodal ta šport
          return;
        }

        await updateDoc(userRef, {
          sports: [...userSports, selectedSport] //posodobi športe
        });

        fetchUserSports();
      }
    }
  };

  const onRemoveSport = async (sportId) => {
    const userRef = doc(db, 'users', userUid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userSports = userDoc.data().sports || [];
      const updatedSports = userSports.filter(sport => sport !== sportId);

      await updateDoc(userRef, {
        sports: updatedSports
      });

      fetchUserSports();
    }
  };

  const onLogout = () => {
    signOut(auth);
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
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
        <TouchableOpacity style={styles.opacityButton} onPress={handleAddSport}>
      <Text style={styles.buttonText}>{showSportPicker ? 'Confirm Selection' : 'Add Favourite Sport'}</Text>
    </TouchableOpacity>
    {showSportPicker && (
      <Picker selectedValue={selectedSport} onValueChange={(itemValue) => setSelectedSport(itemValue)}>
        {sports.map((sport, index) => (
          <Picker.Item key={index} label={sport.name} value={sport.id} />
        ))}
      </Picker>
    )}
        {userSports.length > 0 && (
          <View>
            <Text style={styles.userInfo}>Favourite Sports:</Text>
            {userSports.map((sport, index) => (
              <View key={index} style={styles.favouriteSportContainer}>
                <Text style={styles.userInfo}>{sport.name}</Text>
                <TouchableOpacity style={styles.opacityButton} onPress={() => onRemoveSport(sport.id)}>
                  <Text style={styles.buttonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  opacityButtonLogout: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'red',
    borderRadius: 25,
    alignItems: 'center',
    alignSelf: 'flex-end',
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
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 10
  },
  favouriteSportContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f0f0f0'
  }
});

const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
  posts: store.userState.posts,
});

export default connect(mapStateToProps, null)(Profile);