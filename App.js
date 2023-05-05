
import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { app } from './components/auth/firebaseConfig';
import { getAuth } from 'firebase/auth';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LandingScreen from './components/auth/Landing';
import RegisterScreen from './components/auth/Register';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// For Firebase JS SDK v7.20.0 and later, measurementId is optional


const Stack = createStackNavigator();

export class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded : false,
        }
    }
    componentDidMount() {
        const auth = getAuth(app);
        auth.onAuthStateChanged((user) => {
            if (!user) {
                this.setState({
                    loggedIn: false,
                    loaded: true,
                });
            } else {
                this.setState({
                    loggedIn: true,
                    loaded: true,
                });
            }
        });
    }
    render() {
        const { loggedIn, loaded } = this.state;
        if(!loaded) {
            return(
                <View>
                    <Text style ={{ flex: 1, justifyContent: 'center' }}>Loading</Text>
                </View>
            )

        }
        if(!loggedIn) {
        return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Landing">
                <Stack.Screen name="Landing" component={LandingScreen} options={{ headerShown: false }}/> 
                <Stack.Screen name="Register" component={RegisterScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
        }
        return(
            <View style ={{ flex: 1, justifyContent: 'center' }}>
                <Text>User is logged in</Text>
            </View>
        )
  }
}

export default App;

