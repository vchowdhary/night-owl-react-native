import React from 'react';
import { TaskManager, Location, Notifications } from 'expo';
import {
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TouchableHighlight,
    View,
    TextInput,
    ActivityIndicator,
    Alert,
    Picker,
    FlatList,
    Dimensions,
    AsyncStorage
  } from 'react-native';
  import {Button, Label, Input, Text, Slider} from 'react-native-elements';
import RNPickerSelect from 'react-native-picker-select';
import MapView from 'react-native-maps';
import Marker from 'react-native-maps';
import { PROVIDER_GOOGLE } from 'react-native-maps';

import { MonoText } from '../components/StyledText';
import Geolocation from '../src/Location';

import config from '../config';

console.log(config);
const url = config.url;
const API3 = '/api/subjects';
const API2 = '/api/history/';
const API = '/api/match/';
const API4 = '/api/locationtracking/';
const API5 = '/api/statuses';
const APIUsers = '/api/users';
var id = null;
var profile = null;
var offers = true;

console.log('Defining task');
TaskManager.defineTask("backgroundlocation", async ({ data: { locations }, error }) => {
  if (error) {
    // check `error.message` for more details.
    console.log(error.message);
    return;
  }
  console.log('calling update location');
  console.log(locations[0]);
  updatePosition(locations[0]);
});


export default class MatchRequestScreen extends React.Component {
  constructor(props){
    super(props);

    this.state = {
        id: '', 
        profile: {},
        loading: false,
        redirect: false,
        request: { 
            type: 'tutoring', 
            subject_1: '',
            subject_2: '',
            subject_3: '',
            details: '', 
            timetodeliver: 0,
            dropofflocation: {},
            location: {}
        },
        selectedsubject: '',
        newTutoringSubject: '',
        newDeliveryCategory: '',
        tutoringSubjects: [],
        deliveryCategories: [],
        currentLatLng: {
            lat: 0,
            lng: 0
        },
        markers: [{ id: 'currpos', lat: -1, lng: -1, color: 'blue' }],
        profile: {},
        offers: true,
    };

    ['renderDropdown',
      'showPosition',
      'onChange',
      'renderDropdownService',
      'addItem',
    'requestChange',
    'addMarker',
    'calculateDistance',
    'deg2rad',
    'matchRequest',
    'addMatchToRecords',
    'pushToDatabase',
    'onMarkerPositionChanged',
    'makeDeliveryOffer']
    .forEach(key => {
        this[key] = this[key].bind(this);
    });
  }


  /**
     * runs when component will mount
     */
    async componentWillMount(){
        this.renderDropdown('tutoringSubjects');
        this.renderDropdown('deliveryCategories');
        this.showPosition();
        console.log('Params');
        const id = await AsyncStorage.getItem("userToken")
        .then(async (res) => {
          console.log(res);
          this.setState({id: res});
          console.log('id');
          console.log(this._id);
          id = res;

          console.log('Configuring Background Geolocations');
          Location.startLocationUpdatesAsync('backgroundlocation', {
            timeInterval: 2000,
            showsBackgroundLocationIndicator: true,
          });
          
          return res;
        });
        this._id = id;
        console.log(this._id);
        
    }

    /**
     * Handles changes in form data.
     *
     * @private
     * @param {string} key - The changed key.
     * @param {*} value - The new value.
     */
    onChange(key, value) {
        this.setState({ [key]: value });
        //console.log(this.state);
    }

/**
     * Gets and sets current position
     */
    async showPosition() {
        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
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
                    this.onChange('markers', this.state.markers);
                    console.log(this.state);
                }
            );
        } else {
            error => console.log(error);
        }
    }

    addItem(service){
        console.log("pressed");
    
        var serviceID = service;
    
    
        var newsubject = service === 'tutoring' ? 'newTutoringSubject' : 'newDeliveryCategory';
    
        var subjects = service === "tutoring" ? "tutoringSubjects" : "deliveryCategories";
        
        if (this.state.request['subject_1']=== "Other" || this.state.request['subject_2']=== "Other" || this.state.request['subject_3']=== "Other"){
          this.pushToDatabase(this.state[[newsubject]], service);
          subjects.push({label: this.state[[newsubject]], value: this.state[[newsubject]]})
        }

        this.setState({[serviceID]: this.state[[serviceID]]});
        this.setState({[subjects]: this.state[[subjects]]});
        //console.log(this.state);
    
      }

async renderDropdown(key) {
    console.log('Getting subjects');
    await fetch(url + API3 + '?service=' + key, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      }
    })
    .then(res => {
      console.log(res.status)
      //console.log(res._bodyText);
      if (res.status === 201){
          console.log('Success!!');
          if(key === 'tutoringSubjects'){
            console.log("Subjects");
            var old = JSON.parse(res._bodyText);
           
            var subjects = old.map((x) => {
              return {label: x["subject"], value: x["subject"]}
            });
            subjects.push({label: "Other", value: "Other"});
            //console.log(subjects);
            this.setState({ [key]: subjects });
          }
          else{
            console.log("Categories");
            var old = JSON.parse(res._bodyText);
            var subjects = old.map((x) => {
              return {"label": x["category"], "value": x["category"]}
            });
            subjects.push({label: "Other", value: "Other"});
            this.setState({ [key]: subjects });
          }
          
      }
  })
  .catch((error) => {
      console.log(error);
      return error;
  });

}

addMarker(){
    if (this.state.markers.length !== 2){
        this.state.markers.push({ id: 'second', color: 'red', lat: this.state.currentLatLng.lat, lng: this.state.currentLatLng.lng });
    }
    this.onChange('markers', this.state.markers);
}

renderDropdownService(service){
    const placeholder = {
      label: 'Select a subject...',
      value: null,
      color: '#9EA0A4',
    };

    var items = service==="tutoring" ? 'tutoringSubjects' : 'deliveryCategories';
    //console.log(this.state[[items]]);

    return (
        <View>
      <Text styles={styles.labelText}>Primary Category</Text>
      <RNPickerSelect
          placeholder={placeholder}
          items={this.state[[items]]}
          onValueChange={value => {
            this.requestChange('subject_1', value)
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
        <Text styles={styles.labelText}>Second Category</Text>
        <RNPickerSelect
            placeholder={placeholder}
            items={this.state[[items]]}
            disabled={this.state.request.type === 'delivery'}
            onValueChange={value => {
              this.requestChange('subject_2', value)
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
          <Text styles={styles.labelText}>Third Category</Text>
          <RNPickerSelect
              placeholder={placeholder}
              items={this.state[[items]]}
              disabled={this.state.request.type === 'delivery'}
              onValueChange={value => {
                this.requestChange('subject_3', value)
                //console.log(this.state);
              }}
              style={{
                ...pickerSelectStyles,
                placeholder: {
                  color: 'gray',
                  fontSize: 12,
                  fontWeight: 'bold',
                },
              }}
            />
        </View>
    );
  }

  requestChange(key, value) {
    console.log(key);
    if(key === 'type'){
        if(value === 'delivery'){
            console.log('delivery');
            this.addMarker();
            this.state.request.timetodeliver = 0;
        }
        else{
            if(this.state.markers.length === 2){
                this.state.markers.pop();
            }
        }
    }
    var requestobj = this.state.request;
    var obj = { request: requestobj };
    requestobj[key] = value;

    this.setState(obj);
    console.log(this.state);
}

/**
     * Match request submit
     * @param {event} event - event
     */
    async matchRequest() {
        //console.log(this.state.request);
        
        if (this.state.markers.length === 2){
            this.state.request.timetodeliver = await this.calculateDistance(this.state.markers[0].lat, this.state.markers[0].lng, this.state.markers[1].lat, this.state.markers[1].lng);
            this.state.request.dropofflocation = { lat: this.state.markers[1].lat, lng: this.state.markers[1].lng };
        }
        else{
            this.state.request.timetodeliver = 0;
            this.state.request.dropofflocation = {};

        }

        this.state.request.location = { lat: this.state.markers[0].lat, lng: this.state.markers[0].lng };

        await this.addMatchToRecords(this.state.request, true)
        .then(async (matchID) => {
          console.log(matchID);
          console.log(this.state.id);

          console.log("Getting matches");
          await fetch(url + API + '?limit=' + 5 + '&request=' + JSON.stringify(this.state.request) + '&matchID=' + matchID + '&requester_id=' + this.state.id,
          {
              method: 'GET'
          })
          .then(function(res){
              if(res.status == 200 || res.status == 201 || res.status == 204){
                  console.log('SUCCESS GETTING MATCHES');
                  return res._bodyText;
              }
          });  
        });     
    }

    calculateDistance(lat1, lon1, lat2, lon2){
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
      
    deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

    async makeDeliveryOffer(places) {
      console.log(places);
      this.setState({offers: false});
    }

    /**
     * adds to match history
     * @param {JSON} reqobj - request obj
     * @param {boolean} isRequest - true if it is a
     */
    async addMatchToRecords(reqobj, isRequest)
    {
        console.log('Adding match to records');
        if (isRequest)
        {
            const result = await fetch(url + API2, {
                method: 'PUT',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ requester_id: this.state.id, provider_id: '', service_type: reqobj.type, subject_1: reqobj.subject_1, subject_2: reqobj.subject_2, subject_3: reqobj.subject_3, 
                    details: reqobj.details, time: reqobj.timetodeliver, location: { lat: this.state.markers[0].lat, lng: this.state.markers[0].lng }, provider_score: 0, requester_score: 0, dropOffLocation: reqobj.dropofflocation })
            })
            .then((res) => {
                if(res.status == 200 || res.status == 201 || res.status == 204){
                    console.log("SUCCESS");
                    console.log(res._bodyText);
                    return res._bodyText;
                }
            });
            console.log(result);
            return result;
        }
        else{
            await fetch(url + API2, {
                method: 'PUT',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ requester_id: '', provider_id: this._id, service_type: reqobj.type, subject: reqobj.subject, 
                    details: reqobj.details, time: 0, location: { lat: this.state.markers[0].lat, lng: this.state.markers[0].lng }, score: 0, dropOffLocation: reqobj.dropofflocation })
            })
            .then((res) => {
                if(res.status == 200 || res.status == 201 || res.status == 204){
                    console.log("SUCCESS");
                    console.log(res._bodyText);
                    return res._bodyText;
                }
            })
        }
    }
    
   async pushToDatabase(name, service){
     console.log('Pushing subjects');
     await fetch(url + API3, {
         method: 'PUT',
         headers: {
           Accept: 'application/json',
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({ name, service })
     })
     .then(res => {
       console.log(res.status)
       //console.log(res._bodyText);
       if (res.status === 201){
           console.log('Success!!');
       }
     })
     .catch((error) => {
         console.log(error);
         return error;
     });      
 }

 onMarkerPositionChanged(coords, index){
  console.log(coords);
  console.log(index);
  this.state.markers[index].lat = coords.latitude;
  this.state.markers[index].lng = coords.longitude;
  this.onChange('markers', this.state.markers);
  console.log(this.state);
}

  render() {
    const services = [
        {label: 'Tutoring', value: 'tutoring'},
        {label: 'Delivery', value: 'delivery'},
    ]
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container}>
        <Text style={styles.labelText}>What type of request are you making?</Text>
        <RNPickerSelect
              placeholder={{
                label: 'Select a service...',
                value: null,
                color: '#9EA0A4',
              }}
              items={services}
              onValueChange={value => {
                this.requestChange('type', value);
              }}
              style={{
                ...pickerSelectStyles,
                placeholder: {
                  color: 'gray',
                  fontWeight: 'bold',
                }
        }}/>
        <Text style={styles.labelText}>{this.state.request.type === 'tutoring' ? 'What subject do you need help with?' : 'What do you need delivered?'} </Text>
        {this.state.request.type === 'tutoring' ? this.renderDropdownService('tutoring') : this.renderDropdownService('delivery')}
        <Input 
            style={styles.input}
            onChangeText={(value) => { this.state.request.type === 'tutoring' ? this.setState({newTutoringSubject: value}) : this.setState({newDeliveryCategory: value})}}
            value={this.state.request.type === 'tutoring' ? this.state.newTutoringSubject : this.state.newDeliveryCategory}
            label={this.state.request.type === 'tutoring' ? "NEW SUBJECT" : 'NEW CATEGORY'}
            editable={this.state.selectedsubject === "Other"}
          />
          <Button onPress={() => { this.addItem("tutoring") }} title={this.state.request.type === 'tutoring' ? "Add Subject" : "Add Category"} />
          <Input
              style={styles.input}
              onChangeText={(value) => { this.requestChange('details', value)}}
              label={"ADDITIONAL DETAILS"}/>
           <Text style={styles.biglabelText}>{this.state.request.type === 'delivery' ? 'Please select where you are picking up items from (blue marker) and where you will deliver them (red marker)' : 'Please select where you will be tutoring.'}</Text>
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
                    onDragEnd={(e) => this.onMarkerPositionChanged(e.nativeEvent.coordinate, index)}
                  />
                ))}
           </MapView>
            
           <Button onPress={this.matchRequest} title={"Submit"} />
           
        </ScrollView>
      </View>
    );
  }
}

updatePosition = async (location) =>
  {
    console.log('Updated position');
    const id = await AsyncStorage.getItem("userToken")
        .then(async (res) => {
          console.log(res);
          console.log('id');
         return res;
    });
    console.log(id);

    if(id != null)
    {
      console.log('Received new locations', location);
      console.log('latitude', location.coords.latitude);
      console.log('longitude', location.coords.longitude);
      await fetch(url + API4, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            userID: id
          }),
      })
      .then(res => {
          console.log(res.status)
          if (res.status === 204){
              console.log('Success!!');
          }
      })
      .catch((error) => {
          console.log(error);
          return error;
      });
  
      if(!profile){
        console.log('Getting user profile');
        const reqURL = url + `/api/users/${encodeURIComponent(id)}`;
        console.log(reqURL);
        profile = await fetch(reqURL, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            })
            .then((res) =>{
              console.log(res.status);
              if(res.status === 200 || res.status === 201 || res.status === 204)
              {
                console.log('Success');
                console.log(JSON.parse(res._bodyText));
                return JSON.parse(res._bodyText);
              }
            }); 
  
    }
  }

    //https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-33.8670522,151.1957362&radius=1500&type=restaurant&keyword=cruise&key=AIzaSyBfxlrjGDrdWc8Ycg9WA9dAi5bJcEuO1_g
    if(profile.delivery["Food"] !== null && offers)
    {
      console.log('can deliver');
      console.log(profile.delivery["Food"]);
      console.log(profile.delivery['timetopickup']);
      const distance = 100 * profile.delivery['timetopickup'];
      console.log(distance);

      const places_url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + 
                          location.coords.latitude +',' + location.coords.longitude +
                          '&radius='+distance+
                          '&type=restaurant&opennow&fields=name,geometry/location&key=AIzaSyBfxlrjGDrdWc8Ycg9WA9dAi5bJcEuO1_g';
      await fetch(places_url)
      .then(async (res) =>
      {
          let result = JSON.parse(res._bodyText);
          console.log(result.results);
          if(JSON.parse(res._bodyText) !== [])
          {
            var localNotif = {
              title: "Would you like to make an offer for delivery?", 
              body: "We've detected that you're close to several restaurants and have expressed an interest in delivering food.", 
              data: { 
                      to: id,
                      places: result.results,
                      message: "We've detected that you're close to several restaurants and have expressed an interest in delivering food.",
                      time: 0,
                      title: "Would you like to make an offer for delivery?"
                    }, 
              android: { 
                sound: true 
              }, 
              ios: { 
                sound: true 
              }
            }
            await Notifications.presentLocalNotificationAsync(localNotif);
        }
      });
    
  }
}



const styles = StyleSheet.create({
  biglabelText:{
    fontVariant: ['small-caps'],
    color: '#708090',
    fontSize: 18,
    fontWeight: 'bold',
    padding: 10,
  },
  labelText: {
    color: '#708090',
    fontSize: 14,
    fontWeight: 'bold',
    padding: 5,
  },
  input: {
    padding: 15,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  map: {
   height: 500,
   width: Dimensions.screenWidth
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

  

  
