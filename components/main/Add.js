import React, { useState, useEffect } from 'react';
import { Text, TextInput, View, StyleSheet, Modal, TouchableOpacity, Platform } from 'react-native';
import { app } from '../auth/firebaseConfig';
import { getFirestore, collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getUserLocation } from '../../redux/actions/index';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function Add() {
  const [caption, setCaption] = useState('');
  const [participants, setParticipants] = useState('');
  const [dateOfActivity, setDateOfActivity] = useState(new Date());
  const [sport, setSport] = useState('');
  const [tempSport, setTempSport] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [sports, setSports] = useState([]);

  useEffect(() => {
    const fetchSports = async () => {
      const db = getFirestore(app);
      const sportsRef = collection(db, 'sports');
      const sportsSnap = await getDocs(sportsRef);
      let sportsData = [];
      sportsSnap.forEach(sport => {
        sportsData.push(sport.id);
      });
      setSports(sportsData);
    };
    fetchSports();
  }, []);

  const onAddPost = async () => {
    const location = await getUserLocation();
  
    const db = getFirestore(app);
    const auth = getAuth(app);
    const postsRef = collection(db, 'posts');  // Changes made here
  
    await addDoc(postsRef, {
      caption,
      uid: auth.currentUser.uid,  // Added uid field
      participants: parseInt(participants),
      dateOfActivity: dateOfActivity.toISOString(),
      sport,
      location,
      creation: serverTimestamp(),
    });
  
    // clear the fields
    setCaption('');
    setParticipants('');
    setDateOfActivity(new Date());
    setSport('');
  };
  

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Caption"
        style={styles.input}
        value={caption}
        onChangeText={setCaption}
      />
      <TextInput
        placeholder="Number of participants"
        style={styles.input}
        value={participants}
        onChangeText={setParticipants}
        keyboardType="numeric"
      />
      <DateTimePicker
        testID="dateTimePicker"
        value={dateOfActivity}
        mode="datetime"
        is24Hour={true}
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        onChange={(event, selectedDate) => {
          const currentDate = selectedDate || dateOfActivity;
          setDateOfActivity(currentDate);
        }}
        minimumDate={new Date()}
      />
      <TouchableOpacity style={styles.opacityButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Select Sport</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Picker
              selectedValue={tempSport}
              style={styles.pickerStyle}
              onValueChange={(itemValue) => setTempSport(itemValue)}
            >
              {sports.map((sport, index) => (
                <Picker.Item label={sport} value={sport} key={index} />
              ))}
            </Picker>
            <TouchableOpacity
              style={styles.opacityButton}
              onPress={() => {
                setSport(tempSport);
                setModalVisible(false);
              }}
            >
              <Text style={styles.buttonText}>Select</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <TouchableOpacity style={styles.opacityButton} onPress={onAddPost}>
        <Text style={styles.buttonText}>Add Post</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingLeft: 10,
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
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  pickerStyle: {
    height: 150,
    width: 300,
  },
});
