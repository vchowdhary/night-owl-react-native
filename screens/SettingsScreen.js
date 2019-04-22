import React from 'react';
import { ExpoConfigView } from '@expo/samples';
import { Button, AsyncStorage } from 'react-native';
import Geolocation from '../src/Location';

export default class SettingsScreen extends React.Component {
  async componentDidMount(){
    const id = await AsyncStorage.getItem("userToken");
    console.log(id);
  }
  static navigationOptions = function (props){
    return {
      headerMode: 'screen',
      headerTitle: 'Settings',
      drawerLabel: 'Settings',
      title: 'Settings',
      headerLeft: <Button onPress={() => props.navigation.navigate('DrawerToggle')} title= "=" />
    }
  };

  render() {
    /* Go ahead and delete ExpoConfigView and replace it with your
     * content, we just wanted to give you a quick view of your config */
    return <ExpoConfigView />;
  }
}
