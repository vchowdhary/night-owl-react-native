import React from 'react';
import { Platform, StatusBar, StyleSheet, View, Alert, AppState, AsyncStorage } from 'react-native';
import { AppLoading, Asset, Font, Icon, Permissions, Notifications, Location, TaskManager } from 'expo';
import AppNavigator from './navigation/AppNavigator';
import MainTabNavigator from './navigation/MainTabNavigator';
import PushNotification from './src/pushNotifications';
import DropdownAlert from 'react-native-dropdownalert';
import {Button, Label, Input, Text, Slider} from 'react-native-elements';
import Modal from 'react-native-modalbox';
import RNPickerSelect from 'react-native-picker-select';
import MapView from 'react-native-maps';
import Marker from 'react-native-maps';
import { PROVIDER_GOOGLE } from 'react-native-maps';

import config from './config';

console.log(config);
const url = config.url;
const API2 = '/api/history/';
const API = '/api/match/';

export default class App extends React.Component {
  state = {
    isLoadingComplete: false,
    offers: true,
    places: [],
    selected_place: "",
    currentLatLng: {
      lat: 0,
      lng: 0
    },
    markers: [{ id: 'currpos', lat: -1, lng: -1, color: 'blue' }, { id: 'selected_place', lat: -1, lng: -1, color: 'red' }],
  };

  

  componentDidMount()
  {
    Permissions.askAsync(Permissions.NOTIFICATIONS);
    PushNotification.registerForPushNotificationsAsync();
    Expo.Notifications.createChannelAndroidAsync('channel1', {
      name: 'Default',
      sound: true,
      priority: 'max',
    });
    this._notificationSubscription = Notifications.addListener(this._handleNotification);
  }

  render() {
    const placeholder = {
      label: 'Select a restaurant...',
      value: null,
      color: '#9EA0A4',
    };
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
          <Modal style={styles.modal3} position={"center"} ref={"modal3"}>
                        <Text style={styles.biglabelText}> Make a delivery offer </Text>
                        <View style={{alignItems: 'center'}}>
                          <Text styles={styles.labelText}>Select a restaurant to deliver from.</Text>
                          <RNPickerSelect
                              placeholder={placeholder}
                              items={this.state.places}
                              onValueChange={(value, index) => {
                                this._changeSelectedPlace(index, value);
                                //console.log(this.state);
                              }}
                              style={{
                                ...pickerSelectStyles,
                                placeholder: {
                                  color: 'gray',
                                  fontWeight: 'bold',
                                },
                              }}
                            />
                            <Text styles={styles.labelText}>Move the blue marker to the drop off location. </Text>
                            
                             <MapView
                              style={styles.map}
                              region={{
                              latitude: this.state.currentLatLng.lat,
                              longitude: this.state.currentLatLng.lng,
                              latitudeDelta: 0.02,
                              longitudeDelta: 0.02
                              }}
                              provider={PROVIDER_GOOGLE}
                            >
                            {this.state.markers.map((marker, index) => (
                                <MapView.Marker key={index} draggable
                                  coordinate={{latitude: marker.lat, longitude: marker.lng}}
                                  pinColor={marker.color}
                                  onDragEnd={(e) => this._onMarkerPositionChanged(e.nativeEvent.coordinate, index)}
                                />
                              ))}
                            </MapView>
                              
                            
                        </View>
                       
                        <Button onPress={this._makeDeliveryOffer} title={"Submit"} />
                        
          </Modal>
        </View>
      );
    }
  }

  _onMarkerPositionChanged = (coords, index) =>{
    console.log(coords);
    console.log(index);
    this.state.markers[index].lat = coords.latitude;
    this.state.markers[index].lng = coords.longitude;
    this.setState({markers: this.state.markers});
    console.log(this.state);
  }

  _showPosition = async () => {
    if (navigator.geolocation) {
        watchId = navigator.geolocation.getCurrentPosition(
            position => {
                //console.log(position);
                this.setState(({
                    currentLatLng: {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    }
                }));
                this.state.markers[0].lat = this.state.currentLatLng.lat;
                this.state.markers[0].lng = this.state.currentLatLng.lng;
                this.setState({markers: this.state.markers});
                console.log(this.state);
            }
        );
    } else {
        error => console.log(error);
    }
}

  _changeSelectedPlace = (index, value) => {
    console.log(index);
    console.log(this.state.places[index-1]["label"]);
    console.log(value);
    this.state.markers[1] = value;
    this.setState({markers: this.state.markers, selected_place: this.state.places[index-1]["label"]});
    console.log(this.state.selected_place);
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
    //console.log(notification.data);
    console.log(notification.data.time === 0);

    console.log("Delivery status");
    console.log(notification.data.title === "Would you like to make an offer for delivery?");
    if(notification.data.title === "Would you like to make an offer for delivery?"){
      if(this.state.offers)
      {
        this._dropdown.alertWithType('info', notification.data.title, notification.data.message, notification.data, 3000);
      }
    }
    else{
        if(notification.data.time === 0)
        {
          console.log(notification.data.title);
          if(notification.data.title === "Match Failed" || 
            notification.data.title === "Request Confirmed" ||
            notification.data.title === "Offer Confirmed")
          {
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
          else
          {
              if(notification.data.prev != null)
              {
                console.log(notification.data.prev);
                console.log("Getting status");
                await PushNotification.getStatus(notification.data.prev)
                .then(async (status) => {
                  console.log(status);
                  if(status === null || status === "missed" || status === "rejected" || status === "later")
                  {
                      console.log('Presenting local notification');
                      //await Notifications.presentLocalNotificationAsync(localNotif);
                      var type = "info";
                      console.log(type);
                      console.log(notification.data);
                      this._dropdown.alertWithType(type, notification.data.title, notification.data.message, notification.data, 3000);
                      
                  }
                  else if(status === "done" || status === "accepted")
                  {
                    PushNotification.setStatus(notification.data.id, "done");
                  }
              });
            }
            else{
              console.log('Presenting local notification');
                      //await Notifications.presentLocalNotificationAsync(localNotif);
              var type = "info";
              console.log(type);
              console.log(notification.data);
              this._dropdown.alertWithType(type, notification.data.title, notification.data.message, notification.data, 3000);
            }
          }
        }
      else{
        let time = Date.now();
        console.log('Scheduling local notification');
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
                  title: notification.data.title 
                }, 
          android: { 
            sound: true 
          }, 
          ios: { 
            sound: true 
          }
        }
        const sid = await Notifications.scheduleLocalNotificationAsync(localNotif, {time: time + 6000});
        
      }
    }

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

_handleAppStateChange = async (nextAppState) => {
  const id = await AsyncStorage.getItem("userToken")
  .then(async (res) => {
    console.log(res);
    if (res != null)
    {
      await fetch(url + API5, 
        {
          method: 'PUT',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: {
            id: res,
            status: nextAppState
          }
        });
    }
  });
  
};

  _acceptMatch = async (data) => {
    console.log(data.payload.id);
    console.log("Setting status");
    PushNotification.setStatus(data.payload.id, "accepted");
    await Notifications.dismissAllNotificationsAsync().then((data) => {
      console.log("Dismissed!");
    });
    this._dropdown.alertWithType('info', 'Match confirmed!', 'Please rate your match at the Inbox page!', null, 3000);
    
  }

  _makeDeliveryOffer = async () => {
    console.log("Making delivery offer");
    const dropofflocation = {lat: this.state.markers[0].lat, lng: this.state.markers[0].lng };
    
    console.log('Adding match to records');
    console.log(url + API2);
    console.log(JSON.stringify({ requester_id: '', provider_id: this.state.id, service_type: "delivery", subject: "Food", 
    details: this.state.selected_place, time: 0, location: { lat: this.state.markers[1].lat, lng: this.state.markers[1].lng }, score: 0, dropOffLocation: dropofflocation}));
    console.log(this.state.selected_place);

    fetch(url + API2, {
      method: 'PUT',
      headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requester_id: '', provider_id: this.state.id, service_type: "delivery", subject: "Food", 
          details: this.state.selected_place, time: 0, location: { lat: this.state.markers[1].lat, lng: this.state.markers[1].lng }, score: 0, dropOffLocation: dropofflocation}),
    })
    .then(async (res) => {
        console.log(res);
        if(res.status == 200 || res.status == 201 || res.status == 204){
            console.log("SUCCESS");
            console.log(res._bodyText);

            console.log("Matching");

            var dist = this.calculateDistance(this.state.markers[0].lat, this.state.markers[0].lng, this.state.markers[1].lat, this.state.markers[1].lng);
            console.log(dist);

            const request = {
              type: 'delivery', 
              subject_1: 'Food',
              subject_2: '',
              subject_3: '',
              details: this.state.selected_place, 
              timetodeliver: dist,
              dropofflocation: dropofflocation,
              location: {lat: this.state.markers[1].lat, lng: this.state.markers[1].lng}
            };
            
            console.log("Request:");
            console.log(request);

            fetch(url + API + '?limit=' + 5 + '&offer=' + JSON.stringify(request) + '&matchID=' + res._bodyText + '&provider_id=' + this.state.id,
            {
                method: 'GET'
            })
            .then(function(res){
                if(res.status == 200 || res.status == 201 || res.status == 204){
                    console.log('SUCCESS GETTING MATCHES');
                    return res._bodyText;
                }
            });  

        }
    });
    
    //this.setState({offers: false});
    this.refs.modal3.close();
    
  }

  calculateDistance = (lat1, lon1, lat2, lon2)=>{
    var R = 6371; // Radius of the earth in km
    var dLat = this.deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = this.deg2rad(lon2 - lon1); 
    var a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    var d = R * c; // Distance in km
    return d * 1000 / (60);
}
  
deg2rad = (deg)=>{
    return deg * (Math.PI / 180);
}

  _onClose = (data) => {
    console.log('Drop down closed');
    //console.log(data);
    if(data.payload != null)
    {
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
      else if(data.payload.title === "Would you like to make an offer for delivery?")
      {
        console.log('Closed the delivery thing');
        console.log(data.payload.to);
        if(data.action === 'tap')
        {
          this._showPosition();
          console.log("Places:");
          console.log(data.payload.places[0]);
          const place = data.payload.places;
          var places = (place).map((x) => {
            return {label: x["name"], value: x["geometry"]["location"]}
          });
          this.setState({ places: places, id: data.payload.to });
          this.refs.modal3.open();
        }
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
    alignContent: 'center'
  },
  matchContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  biglabelText:{
    color: '#708090',
    fontSize: 18,
    fontWeight: 'bold',
    padding: 10,
  },
  labelText: {
    color: '#708090',
    fontSize: 12,
    fontWeight: 'bold',
    flex: 1,
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
  modal3: {
      height: 600,
      width: 500,
      alignItems: 'center',
  },
  
  btn: {
      flex: 1,
      padding: 10
  },
  map: {
    height: 400,
    width: 300,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});

