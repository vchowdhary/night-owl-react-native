import React from 'react';
import { Platform, StatusBar, StyleSheet, View, Alert, Text, Button } from 'react-native';
import { AppLoading, Asset, Font, Icon, Permissions, Notifications } from 'expo';
import AppNavigator from './navigation/AppNavigator';
import MainTabNavigator from './navigation/MainTabNavigator';
import PushNotification from './src/pushNotifications';
import DropdownAlert from 'react-native-dropdownalert';

export default class App extends React.Component {
  state = {
    isLoadingComplete: false
  };

  componentDidMount()
  {
    Permissions.askAsync(Permissions.NOTIFICATIONS);
    PushNotification.registerForPushNotificationsAsync();
    this._notificationSubscription = Notifications.addListener(this._handleNotification);
  }

  render() {
    if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
      return (
        <View>
          <AppLoading
            startAsync={this._loadResourcesAsync}
            onError={this._handleLoadingError}
            onFinish={this._handleFinishLoading}
          />
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
          
          <AppNavigator ref={ref => this._navigator = ref}/>
          <DropdownAlert ref={ref => this._dropdown = ref} closeInterval={3000}
          showCancel={true} onClose={this._onClose} onCancel={this._onClose}/>
        </View>
      );
    }
  }

  _loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([
        require('./assets/images/robot-dev.png'),
        require('./assets/images/robot-prod.png'),
      ]),
      Font.loadAsync({
        // This is the font that we are using for our tab bar
        ...Icon.Ionicons.font,
        // We include SpaceMono because we use it in HomeScreen.js. Feel free
        // to remove this if you are not using it in your app
        'Arial': require('./assets/fonts/SpaceMono-Regular.ttf'),
        'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf')
      }),
    ]);
  };

  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };

  _handleNotification = (notification) => {
    console.log(notification);
    console.log(notification.data);
    if(notification.data.type === 'match_request')
    {
      var message = "New match request from: " + notification.data.from_id;
      this._dropdown.alertWithType('info', "Match Request", message, notification.data, 3000);
    }
    else if(notification.data.type === 'match_failed')
    {
      this._dropdown.alertWithType('error', "Match Failed", notification.data.message, notification.data, 2000);
    }
    else if(notification.data.type === 'match_request_confirmed')
    {
      this._dropdown.alertWithType('success', "Request Confirmed", notification.data.message, notification, 2000);
    }
    else{
      console.log('Type not match');
      this._dropdown.alertWithType('info', 'Look', notification.data.message, notification.data, 3000);
    }
  };

  _acceptMatch = (data) => {
    PushNotification.setStatus(data.payload, "accepted");
    this._dropdown.alertWithType('info', 'Match confirmed!', 'Please rate your match at the Inbox page!', null, 3000);
  }

  _onClose = (data) => {
    console.log(data.payload.type === 'match_request_confirmed');
    console.log(data.title === 'Request Confirmed');
    if (data.payload.type === 'match_request')
    {
      if(data.action === 'tap')
      {
        console.log('Tapped match request');
          Alert.alert(
            'Match Request',
            data.payload.message,
            [
              {text: 'Maybe later', onPress: () => PushNotification.setStatus(data.payload, 'later')},
              {
                text: 'No',
                onPress: () => PushNotification.setStatus(data.payload, 'rejected'),
                style: 'cancel',
              },
              {text: 'Yes', onPress: () => this._acceptMatch(data)},
            ],
            {cancelable: false},
          );
      }
      if(data.action === 'automatic')
      {
        console.log('Missed match request');
        PushNotification.setStatus(data.payload, 'missed');
      }
      if(data.action === 'pan' || data.action === 'cancel'){
        console.log('Panned match request');
        PushNotification.setStatus(data.payload, 'later');
      }
    }
    else if(data.payload.type === "match_request_confirmed" && data.title === "Request Confirmed")
    {
      conso
      console.log(data.action);
      if(data.action === "tap")
      {
        console.log("Going to inbox");
        console.log(this._navigator);
        this._navigator.navigate('Inbox');
        //Navigate to inbox here
      }
    }
  }

  _onCancel = (data) => {
    console.log("Cancelled");
    console.log(data);
    
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
