import React, { Component } from 'react';
import { Text, View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { app } from './firebaseConfig';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

export class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email : '', //nastavi prazni text
            password : '',
        }
        this.onSignIn = this.onSignIn.bind(this)
    }
    onSignIn (){
        const { email, password } = this.state;
        const auth = getAuth(app);
        signInWithEmailAndPassword(auth, email, password) //firestore avtentekacija funkcija
        .then((result) => {
            console.log(result)
        })
        .catch((error) => {
            console.log(error)
        })
    }
    render() {
    return (
      <View style={styles.container}>
        <Text style={styles.headerText}>Login</Text>
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
        <TouchableOpacity style={styles.buttonContainer} onPress={() => this.onSignIn()}>
          <Text style={styles.buttonText}>Sign In</Text>
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

export default Login;
