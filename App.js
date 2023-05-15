
import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { app } from './components/auth/firebaseConfig';
import { getAuth } from 'firebase/auth';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LandingScreen from './components/auth/Landing';
import RegisterScreen from './components/auth/Register';
import LoginScreen from './components/auth/Login';
import MainScreen, { Main } from './components/Main';
import { Provider } from 'react-redux';
import { legacy_createStore as createStore, applyMiddleware} from 'redux';
import rootReducer from './redux/reducers';
import thunk from 'redux-thunk';
import AddScreen from './components/main/Add';
import ChatsScreen from './components/main/Chats';
import ChatScreen from './components/main/Chat';
const store = createStore(rootReducer, applyMiddleware(thunk));

const Stack = createStackNavigator();
//import vseh strani za stack navigator in avtentekacije
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
        }); //app.js se nalozi in preveri login state
    }
    render() {
        const { loggedIn, loaded } = this.state;
        if(!loaded) {
            return(
                <View>
                    <Text style ={{ flex: 1, justifyContent: 'center' }}>Loadingg</Text>
                </View>
            )

        }
        if(!loggedIn) {
        return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Landing">
                <Stack.Screen name="Landing" component={LandingScreen} options={{ headerShown: false }}/> 
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
        }
        return(
            <Provider store={store}>
                <NavigationContainer>
                 <Stack.Navigator initialRouteName="Main">
                <Stack.Screen name="Main" component={MainScreen} /> 
                <Stack.Screen name="Add" component={AddScreen} navigation={this.props.navigation}/> 
                <Stack.Screen name="Chats" component={ChatsScreen} navigation={this.props.navigation}/>
                <Stack.Screen name="Chat" component={ChatScreen} navigation={this.props.navigation}/> 
            </Stack.Navigator>
            </NavigationContainer>
            </Provider>
        ) //stack navigator strani
  }
}

export default App;
