import React from 'react';
import { createSwitchNavigator, createStackNavigator } from 'react-navigation';
import LoginScreen from '../screens/LoginScreen'
import AuthLoadingScreen from '../screens/AuthLoadingScreen'
import { Text, Button, View, TouchableOpacity, Icon } from 'react-native';


import MainTabNavigator from './MainTabNavigator';

const AuthStack = createStackNavigator({ Login: LoginScreen });

export default createSwitchNavigator({
  // You could add another route here for authentication.
  // Read more at https://reactnavigation.org/docs/en/auth-flow.html
  Main: MainTabNavigator,
  AuthLoading: AuthLoadingScreen,
  Auth: AuthStack,
},
{
  initialRouteName: 'AuthLoading'
});