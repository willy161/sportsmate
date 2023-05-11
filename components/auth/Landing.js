import React from 'react'
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native'

export default function Landing({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Welcome</Text>
      <TouchableOpacity style={styles.buttonContainer} onPress={() => navigation.navigate("Register")}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonContainer} onPress={() => navigation.navigate("Login")}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20, 
    backgroundColor: '#f5f5f5' 
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 40 
  },
  buttonContainer: {
    marginVertical: 10,
    backgroundColor: '#841584', // background color for the button
    paddingVertical: 10, // padding for the button
    borderRadius: 5, // rounded corners
    alignItems: 'center' // center the text inside the button
  },
  buttonText: {
    color: '#ffffff', // text color
    fontSize: 16, // font size
    fontWeight: 'bold' // font weight
  }
});
