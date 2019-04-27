import React from 'react';
import { Platform, StatusBar, StyleSheet, View, Alert, Text, Button } from 'react-native';
import { AppLoading, Asset, Font, Icon, Permissions, Notifications } from 'expo';
import AppNavigator from './navigation/AppNavigator';
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
          
          <AppNavigator />
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
      this._dropdown.alertWithType('info', 'Match Request', notification.data.from_id, notification.data, 3000);
    }
    else{
      console.log('Type not match');
      this._dropdown.alertWithType('info', 'Look', notification.data.message, notification.data, 3000);
    }
  };

  _onClose = (data) => {
    console.log(data);
    console.log(data.action);
    if (data.action === 'tap' && data.payload.type == 'match_request')
    {
      Alert.alert(
        'Match Request',
        data.payload.message,
        [
          {text: 'Maybe later', onPress: () => PushNotification.setStatus(data.payload.notif_id, 'later')},
          {
            text: 'No',
            onPress: () => PushNotification.setStatus(data.payload.notif_id, 'rejected'),
            style: 'cancel',
          },
          {text: 'Yes', onPress: () => PushNotification.setStatus(data.payload.notif_id, 'accepted')},
        ],
        {cancelable: false},
      );
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
