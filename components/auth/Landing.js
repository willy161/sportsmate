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
    padding: 10, // padding for the button
    marginBottom: 10,
    backgroundColor: '#841584', // background color for the button
    borderRadius: 25, // rounded corners
    alignItems: 'center', // center the text inside the button
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  buttonText: {
    color: '#ffffff', // text color
    fontSize: 16, // font size
    fontWeight: 'bold' // font weight
  }
});
