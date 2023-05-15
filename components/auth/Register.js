import React, { Component } from 'react';
import { Text, View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { app } from './firebaseConfig';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from "firebase/firestore";

export class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email : '',
            password : '',
            name : ''
        }
        this.onSignUp = this.onSignUp.bind(this)
    }
    async onSignUp() {
      const { email, password, name } = this.state;
      const auth = getAuth(app);
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
    
        // Save user data to Firestore
        const firestore = getFirestore(app);
        const userDocRef = doc(firestore, "users", user.uid);
        await setDoc(userDocRef, { name, email, picture: "", sports: [] }); // Added sports field
    
        console.log("User registered successfully:", user);
      } catch (error) {
        console.error("Error registering user:", error);
      }
    }
    
    render() {
        return (
          <View style={styles.container}>
            <Text style={styles.headerText}>Register</Text>
            <TextInput 
            style={styles.inputField}
            placeholder="name"
            onChangeText={(name) => this.setState({name})}
            />
            <TextInput 
            style={styles.inputField}
            placeholder="email"
            onChangeText={(email) => this.setState({email})}
            />
            <TextInput 
            style={styles.inputField}
            secureTextEntry={true}
            placeholder="password"
            onChangeText={(password) => this.setState({password})}
            />
            <TouchableOpacity style={styles.buttonContainer} onPress={() => this.onSignUp()}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        )
    }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20, 
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 40 
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
    fontSize: 16
  },
  buttonContainer: {
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
  }
});

export default Register;
