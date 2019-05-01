import React from 'react';
import { Platform, StatusBar, StyleSheet, View, Alert, Text, Button } from 'react-native';
import { AppLoading, Asset, Font, Icon, Permissions, Notifications, Location } from 'expo';
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
    Expo.Notifications.createChannelAndroidAsync('channel1', {
      name: 'Default',
      sound: true,
    });
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


  _handleNotification = async (notification) => {
    console.log("Notification:");
    console.log(notification);
    console.log(notification.data);
    console.log(notification.data.time === 0);

    if(notification.data.prev != null)
    {
      console.log(notification.data.prev);
      console.log("Getting status");
      await PushNotification.getStatus(notification.data.prev)
      .then(async (status) => {
        console.log(status);
        if(status === null || status === "missed")
        {
          var localNotif = {
            title: notification.data.title, 
            body: notification.data.message, 
            data: { from: notification.data.from, 
                    to: notification.data.to,
                    id: notification.data.id,
                    isRequest: notification.data.isRequest,
                    message: notification.data.message,
                    next: notification.data.next,
                    prev: notification.data.prev,
                    time: 0,
                    title: notification.data.title }, 
            android: { 
              sound: true 
            }, 
            ios: { 
              sound: true 
            }
          }

          if(notification.data.time === 0)
          {
            console.log('Presenting local notification');
            //await Notifications.presentLocalNotificationAsync(localNotif);
            var type = "info";
            if(notification.data.title === "Match Failed")
            {
              type = "error";
            }
            else if(notification.data.title === "Request Confirmed" || 
                    notification.data.title === "Offer Confirmed")
            {
              type = "success";
            }

            console.log(type);
            console.log(notification.data);
            this._dropdown.alertWithType(type, notification.data.title, notification.data.message, notification.data, 3000);

          }
          else{
            console.log('Scheduling notification');
            let time = Date.now();
            const sid = await Notifications.scheduleLocalNotificationAsync(localNotif, {time: time + 5000});
            console.log('Presenting local notification');
            /*var type = "info";
            console.log(notification.data.title);
            if(notification.data.title === "Match Failed")
            {
              type = "error";
            }
            else if(notification.data.title === "Request Confirmed" || 
                    notification.data.title === "Offer Confirmed")
            {
              type = "success";
            }

            console.log(type);
            console.log(notification.data);
            this._dropdown.alertWithType(type, notification.data.title, notification.data.message, notification.data, 3000);*/
            //await Notifications.scheduleLocalNotificationAsync(localNotif, {time: time + 1000});
          }
        }
        else if(status === "rejected" || status === "later")
        {
          console.log("Failed! This node should have been deleted!");
        }
        else if(status === "done" || status === "accepted")
        {
          Notifications.dismissNotificationAsync(notification.data.id);
          PushNotification.setStatus(notification.data.id, "done");
        }
    });
    /*
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
    else if(notification.data.type === 'match_offer')
    {
      var message = "New match offer from: " + notification.data.from_id;
      this._dropdown.alertWithType('info', "Match Offer", message, notification.data, 3000);
    }
    else if(notification.data.type === 'match_offer_confirmed')
    {
      this._dropdown.alertWithType('success', "Offer Confirmed", notification.data.message, notification, 2000);
    }
    else{
      console.log('Type not match');
      this._dropdown.alertWithType('info', 'Look', notification.data.message, notification.data, 3000);
    }*/
  }
  
}

  _acceptMatch = (data) => {
    console.log(data.payload.id);
    console.log("Setting status");
    PushNotification.setStatus(data.payload.id, "accepted");
    this._dropdown.alertWithType('info', 'Match confirmed!', 'Please rate your match at the Inbox page!', null, 3000);
    
  }

  _onClose = (data) => {
    console.log('Drop down closed');
    console.log(data);
    console.log(data.payload.title === 'Request Confirmed');
    if (data.payload.title === 'Match Request')
    {
      if(data.action === 'tap')
      {
        console.log('Tapped match request');
          Alert.alert(
            'Match Request',
            data.payload.message,
            [
              {text: 'Maybe later', onPress: () => PushNotification.setStatus(data.payload.id, 'later')},
              {
                text: 'No',
                onPress: () => PushNotification.setStatus(data.payload.id, 'rejected'),
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
        PushNotification.setStatus(data.payload.id, 'missed');
      }
      if(data.action === 'pan' || data.action === 'cancel'){
        console.log('Panned match request');
        PushNotification.setStatus(data.payload.id, 'later');
      }
    }
    else if(data.payload.title === "Request Confirmed")
    {
      console.log(data.action);
      if(data.action === "tap")
      {
        console.log("Going to inbox");
        console.log(this._navigator);
        this._navigator.navigate('Inbox');
        //Navigate to inbox here
      }
    }
    else if (data.payload.title === 'Match Offer')
    {
      if(data.action === 'tap')
      {
        console.log('Tapped match offer');
          Alert.alert(
            'Match Offer',
            data.payload.message,
            [
              {text: 'Maybe later', onPress: () => PushNotification.setStatus(data.payload.id, 'later')},
              {
                text: 'No',
                onPress: () => PushNotification.setStatus(data.payload.id, 'rejected'),
                style: 'cancel',
              },
              {text: 'Yes', onPress: () => this._acceptMatch(data)},
            ],
            {cancelable: false},
          );
      }
      if(data.action === 'automatic')
      {
        console.log('Missed match offer');
        PushNotification.setStatus(data.payload.id, 'missed');
      }
      if(data.action === 'pan' || data.action === 'cancel'){
        console.log('Panned match offer');
        PushNotification.setStatus(data.payload.id, 'later');
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
