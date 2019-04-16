import React from 'react';
import { createSwitchNavigator, createStackNavigator } from 'react-navigation';
import LoginScreen from '../screens/LoginScreen'
import AuthLoadingScreen from '../screens/AuthLoadingScreen'
import { Text, Button } from 'react-native';


import MainTabNavigator from './MainTabNavigator';

const AuthStack = createStackNavigator({ Login: LoginScreen });

const navigationOptionsHeader=({navigation})=>{
    return {
      headerRight: (
      <Button
        onPress={() => navigation.toggleDrawer()}
        title="Info"
        color="#222"
      />
    )
  };
}

export default createSwitchNavigator({
  // You could add another route here for authentication.
  // Read more at https://reactnavigation.org/docs/en/auth-flow.html
  Main: MainTabNavigator,
  AuthLoading: AuthLoadingScreen,
  Auth: AuthStack,
},
{
  initialRouteName: 'AuthLoading',
  navigationOptions: navigationOptionsHeader,
});