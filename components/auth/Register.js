import React, { Component } from 'react';
import { Text, View, Button, TextInput } from 'react-native';
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
          await setDoc(userDocRef, { name, email });
  
          console.log("User registered successfully:", user);
        } catch (error) {
          console.error("Error registering user:", error);
        }
      }
    
    render() {
        return (
          <View>
            <TextInput 
            placeholder="name"
            onChangeText={(name) => this.setState({name})}
            />
            <TextInput 
            placeholder="email"
            onChangeText={(email) => this.setState({email})}
            />
            <TextInput 
            placeholder="password"
            secureTextEntry={true}
            onChangeText={(password) => this.setState({password})}
            />
            <Button
                onPress={() => this.onSignUp()}
                title="Sign Up"
            />
          </View>
        )
    }
} // Add the missing closing brace here

export default Register;
