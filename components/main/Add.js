import React from 'react'
import { Camera, CameraType } from 'expo-camera';
import { useState, useEffect } from 'react';
import { Button, StyleSheet, Text, View, Image, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function Add( {navigation} ) {
  const [type, setType] = useState(CameraType.back);
  const [camera, setCamera] = useState(null);
  const [image, setImage] = useState(null);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1,1],
      quality: 1,
    });
    console.log(result);
    if (!result.cancelled) {
        setImage(result.uri);
    }
    }
  const takePicture = async () => {
    if (camera) {
      const data = await camera.takePictureAsync(null);
      console.log(data.uri);
      setImage(data.uri);
    }
    }

  if (!permission)
  {
    return <View />;
  }

  if (!permission.granted)
  {
    return (
      <View>
        <Text>Permission not granted</Text>
        <Button onPress={requestPermission} title="Request" />
      </View>
    );
  } 

  function toggleCameraType() {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  }

  return (
    <View style={{ flex: 1 }}>
        <View style={styles.cameraContainer}>
      <Camera 
        ref={ref => setCamera(ref)}
        style={styles.fixedRatio} 
        type={type} 
        ratio={'1:1'} />
        </View>
          <Button title="Flip Image"style={{
            flex: 0.1,
            alignSelf: 'flex-end',
            alignItems: 'center',
          }} onPress={toggleCameraType}>
          </Button>
          <Button title="Take Picture" onPress={() => takePicture()}/>
          <Button title="Pick an image from camera roll" onPress={() => pickImage()} />
          <Button title="Save" onPress={() => navigation.navigate('Save', {image})}/>
          {image && <Image source={{ uri: image }} style={{ flex: 1 }}/>}
        
    </View>
  );
}
const styles = StyleSheet.create({
    cameraContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    fixedRatio: {
        flex: 1,
        aspectRatio: 1,
  }
}
  );
  