import React from 'react';
import { ExpoConfigView } from '@expo/samples';

export default class SignOutScreen extends React.Component {
  static navigationOptions = {
    title: 'Sign Out',
  };

  constructor(props) {
    super(props);
    this.signout = this.signout.bind(this);
    this.signout()
    
  }

  async signout(){
    await AsyncStorage.clear();
    this.props.navigation.navigate('Auth');
  }

  async render() {
    /* Go ahead and delete ExpoConfigView and replace it with your
     * content, we just wanted to give you a quick view of your config */
   return <ExpoConfigView/>;
  }
}
