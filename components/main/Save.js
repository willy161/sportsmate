import React, { useState } from 'react';
import { View, TextInput, Image, Button, Platform } from 'react-native';
import { getAuth } from 'firebase/auth';
import { app } from '../auth/firebaseConfig';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getUserLocation } from '../../redux/actions/index';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function Save(props, { navigation }) {
  console.log(props.route.params.image);
  const auth = getAuth(app);
  const [caption, setCaption] = useState('');
  const childPath = `post/${auth.currentUser.uid}/${Math.random().toString(36)}`;
  console.log(childPath);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowPicker(Platform.OS === 'ios');
    setSelectedDate(currentDate);
  };

  const showDatePicker = () => {
    setShowPicker(true);
  };


  const uploadImage = async () => {
    const uri = props.route.params.image;
    const response = await fetch(uri);
    const blob = await response.blob();
    const storage = getStorage(app);
    const storageRef = ref(storage, childPath);
    const task = uploadBytesResumable(storageRef, blob);

    const taskProgress = (snapshot) => {
      console.log(`transferred: ${snapshot.bytesTransferred}`);
    };

    const taskCompleted = async () => {
      const url = await getDownloadURL(storageRef);
      const location = await getUserLocation(); // Get the location when the Save button is pressed
      savePostData(url, location); // Pass the location to the savePostData function
      console.log(url);
    };

    const taskError = (snapshot) => {
      console.log(snapshot);
    };

    task.on('state_changed', taskProgress, taskError, taskCompleted);
  };

  const savePostData = (downloadURL, location) => {
    const firestore = getFirestore(app);
    addDoc(collection(firestore, 'posts', auth.currentUser.uid, 'userPosts'), {
      downloadURL,
      caption,
      creation: serverTimestamp(),
      location: location, // Save the location as an extra field
    }).then(() => {
      props.navigation.popToTop();
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <Image source={{ uri: props.route.params.image }} />
      <TextInput
        placeholder="Write a caption . . ."
        onChangeText={(caption) => setCaption(caption)}
      />
      <Button title="Select Time" onPress={showDatePicker} />
      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="datetime"
          display="default"
          onChange={onChange}
          minimumDate={new Date()} // Set the minimum date to the current date
          timeZoneOffsetInMinutes={0}
        />
      )}
      <Button title="Save" onPress={() => uploadImage()} />
    </View>
  );
}
