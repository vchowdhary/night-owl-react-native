import React from 'react';
import { AsyncStorage, Platform, View, Button, SafeAreaView, TouchableOpacity, Text, Alert } from 'react-native';
import { createStackNavigator, createDrawerNavigator } from 'react-navigation';
import {DrawerItems} from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import HomeScreen from '../screens/HomeScreen';
import LinksScreen from '../screens/LinksScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';

import User from '../src/User';


const HomeStack = createStackNavigator({
  Home: {
    screen: HomeScreen,
    navigationOptions: ({ navigation }) => ({
      initialRouteName: 'Home',
      headerMode: 'screen',
      headerTitle: 'Home',
      drawerLabel: 'Home',
      headerLeft: <Button onPress={() => {
        console.log('pressed');
        //console.log(navigation);
        navigation.toggleDrawer()}
       } title= "="/>
    }),
  }
});

const ProfileStack = createStackNavigator({
  Profile: {
    screen: ProfileScreen,
    navigationOptions: ({ navigation }) => ({
      initialRouteName: 'Profile',
      headerMode: 'screen',
      headerTitle: 'Profile',
      drawerLabel: 'Profile',
      headerLeft: <Button onPress={() => {
        console.log('pressed');
        //console.log(navigation);
        navigation.toggleDrawer()}
       } title= "="/>
    }),
  }
});


const LinksStack = createStackNavigator({
  Links: LinksScreen,
},
{
  navigationOptions: ({ navigation }) => ({
    initialRouteName: 'Links',
    headerMode: 'screen',
    headerTitle: 'Links',
    drawerLabel: 'Links',
    headerLeft: <Button onPress={() => navigation.toggleDrawer()} title= "="/>
  }),
});


const SettingsStack = createStackNavigator({
  Settings: {
    screen: SettingsScreen,
    navigationOptions: ({ navigation }) => ({
        initialRouteName: 'Settings',
        headerMode: 'screen',
        headerTitle: 'Settings',
        drawerLabel: 'Settings',
      headerLeft: <Button onPress={() => navigation.toggleDrawer()} title= "="/>
    }),
  }});

SettingsStack.navigationOptions = {
  tabBarLabel: 'Settings',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-options' : 'md-options'}
    />
  ),
};


const MyDrawerNavigator = createDrawerNavigator({
    Links: {
      screen: LinksStack,
    },
    Home: {
      screen: HomeStack,
    },
    Settings: {
      screen: SettingsStack
    },
    Profile: {
      screen: ProfileStack,
    }
  },
  {
    contentComponent:(props) => (
      <View style={{flex:1}}>
          <SafeAreaView forceInset={{ top: 'always', horizontal: 'never' }}>
            <DrawerItems {...props} />
            <TouchableOpacity onPress={()=>
              Alert.alert(
                'Log out',
                'Do you want to logout?',
                [
                  {text: 'Cancel', onPress: () => {return null}},
                  {text: 'Confirm', onPress: () => {
                    AsyncStorage.clear();
                    User.logout();
                    props.navigation.navigate('Login');
                  }
                  },
                ],
                { cancelable: false }
              )  
            }>
              <Text style={{margin: 16,fontWeight: 'bold'}}>Logout</Text>
            </TouchableOpacity>
          </SafeAreaView>
      </View>
    ),
    drawerOpenRoute: 'DrawerOpen',
    drawerCloseRoute: 'DrawerClose',
    drawerToggleRoute: 'DrawerToggle'
});


export default MyDrawerNavigator;
