import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchUser, fetchUserPosts } from '../redux/actions/index';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; //import icon
import FeedScreen from './main/Feed';
import ProfileScreen from './main/Profile';
import ChatsScreen from './main/Chats';

const EmptyScreen = () => {
  return (null);
}

const Tab = createMaterialBottomTabNavigator();

export class Main extends Component {
  componentDidMount() {
    console.log("Main component mounted");
    this.props.fetchUser();
    this.props.fetchUserPosts();
  }

  componentDidUpdate(prevProps) {
    if (this.props.currentUser !== prevProps.currentUser) {
      this.forceUpdate();
    }
  }

  render() {
      return (
        <Tab.Navigator initialRouteName="Feed" labeled={false}>
        <Tab.Screen name="Feed" component={FeedScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={26} />
          )
        }}/>
        
        <Tab.Screen name="Profile" component={ProfileScreen}
         listeners={({ navigation }) => ({
          tabPress: event => {
              console.log("Profile button pressed");
              event.preventDefault();
              navigation.navigate("Profile", {uid: this.props.currentUser.uid});
          }
      })}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle" color={color} size={26} />
          )
        }}/>
        <Tab.Screen name="ChatsContainer" component={ChatsScreen}
         listeners={({ navigation }) => ({
          tabPress: event => {
              console.log("Chats button pressed");
              event.preventDefault();
              navigation.navigate("Chats");
          }
      })}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="message" color={color} size={26} />
          )
        }}/>
        <Tab.Screen name="AddContainer" component={EmptyScreen} 
        listeners={({ navigation }) => ({
            tabPress: event => {
                console.log("Add button pressed");
                event.preventDefault();
                navigation.navigate("Add");
            }
        })}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="plus-box" color={color} size={26} />
          )
        }}/>
      </Tab.Navigator>
    );
  }
}

const mapStateToProps = (store) =>({
  currentUser: store.userState.currentUser
})
const mapDispatchToProps = (dispatch) => bindActionCreators({ fetchUser, fetchUserPosts }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Main);