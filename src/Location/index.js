import XHRpromise from '../XHRpromise';
import {AsyncStorage} from 'react-native';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';


/**
 * API base path.
 *
 * @private
 * @readonly
 * @type {string}
 */
const API = '/api/locationtracking/';
import config from '../../config';

console.log(config);
const url = config.url;

/**
 * Handles all location tracking
 * @private
 */
class Location{
    /**
     * Initializes location handler. 
     * @param {string} id - user ID
     */
    constructor(id) {
        Object.defineProperties(this, /**@lends Location# */ {  
            _enabled: { value: false, writable: true },
            _latitude: { value: null, writable: true },
            _longitude: { value: null, writable: true },
            /**
             * user ID
             */
            _id: { value: id, writable: false }
        });

        console.log('Configuring Background Geolocations');
        /*BackgroundGeolocation.configure({
            desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
            stationaryRadius: 50,
            distanceFilter: 50,
            notificationTitle: 'Background tracking',
            notificationText: 'enabled',
            debug: true,
            startOnBoot: false,
            stopOnTerminate: true,
            locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
            interval: 10000,
            fastestInterval: 5000,
            activitiesInterval: 10000,
            stopOnStillActivity: false,
            url: url+API,
            // customize post properties
            postTemplate: {
              lat: '@latitude',
              lon: '@longitude',
              id: id // you can also add your own properties
            }
          });
      
          console.log('On location');
          BackgroundGeolocation.on('location', (location) => {
            console.log('Background geolocation');
            console.log(location);
            // handle your locations here
            // to perform long running operation on iOS
            // you need to create background task
            BackgroundGeolocation.startTask(taskKey => {
              // execute long running task
              // eg. ajax post location
              // IMPORTANT: task has to be ended by endTask
              BackgroundGeolocation.endTask(taskKey);
            });
          });
      
          BackgroundGeolocation.on('stationary', (stationaryLocation) => {
            // handle stationary locations here
            console.log(stationaryLocation);
            Actions.sendLocation(stationaryLocation);
          });
      
          BackgroundGeolocation.on('error', (error) => {
            console.log('[ERROR] BackgroundGeolocation error:', error);
          });
      
          BackgroundGeolocation.on('start', () => {
            console.log('[INFO] BackgroundGeolocation service has been started');
          });
      
          BackgroundGeolocation.on('stop', () => {
            console.log('[INFO] BackgroundGeolocation service has been stopped');
          });
      
          BackgroundGeolocation.on('authorization', (status) => {
            console.log('[INFO] BackgroundGeolocation authorization status: ' + status);
            if (status !== BackgroundGeolocation.AUTHORIZED) {
              // we need to set delay or otherwise alert may not be shown
              setTimeout(() =>
                Alert.alert('App requires location tracking permission', 'Would you like to open app settings?', [
                  { text: 'Yes', onPress: () => BackgroundGeolocation.showAppSettings() },
                  { text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel' }
                ]), 1000);
            }
          });
      
          BackgroundGeolocation.on('background', () => {
            console.log('[INFO] App is in background');
          });
      
          BackgroundGeolocation.on('foreground', () => {
            console.log('[INFO] App is in foreground');
          });
      
          BackgroundGeolocation.on('abort_requested', () => {
            console.log('[INFO] Server responded with 285 Updates Not Required');
      
            // Here we can decide whether we want stop the updates or not.
            // If you've configured the server to return 285, then it means the server does not require further update.
            // So the normal thing to do here would be to `BackgroundGeolocation.stop()`.
            // But you might be counting on it to receive location updates in the UI, so you could just reconfigure and set `url` to null.
          });
      
          BackgroundGeolocation.on('http_authorization', () => {
            console.log('[INFO] App needs to authorize the http requests');
          });
      
          BackgroundGeolocation.checkStatus(status => {
            console.log('[INFO] BackgroundGeolocation service is running', status.isRunning);
            console.log('[INFO] BackgroundGeolocation services enabled', status.locationServicesEnabled);
            console.log('[INFO] BackgroundGeolocation auth status: ' + status.authorization);
      
            // you don't need to check status before start (this is just the example)
          
              BackgroundGeolocation.start(); //triggers start on start event
          });*/
    }

    /**
     * Inserts position into database.
     * 
     * @param {string} position - the position from watchPosition
     * @param {string} userID - the userID
     */
    async updatePosition(position, userID){
        console.log('Position');
        console.log(position.coords);
        console.log(userID);
        //console.log(typeof position);

        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;

        this._latitude = position.coords.latitude;
        this._longitude = position.coords.longitude;

        console.log('User id:');
        console.log(userID);
        console.log(latitude);
        console.log(longitude);

        await fetch(url + API, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                latitude: latitude,
                longitude: longitude,
                userID: userID
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

        //Map.updateMap(latitude, longitude);
        //this._id = id;
        return this;
    }

    /** 
     * Authorizes location tracking
     * @param {string} userID - the user id 
     */
    async enableLocationPermission(userID){
        //navigator.geolocation.requestAuthorization();
        console.log('Get current position');
        navigator.geolocation.getCurrentPosition(
            position => {
                console.log('Updating');
                console.log(position);
                //console.log(id);
                this.updatePosition(position, userID);
                //console.log(this.getLocation(userID));
                this.startLocationUpdates(userID);
            },
            error => console.log(JSON.stringify(error.message)),
            {
                enableHighAccuracy: true
            }
        );

        this._enabled = true;
        console.log('Starting background geolocation');
        //BackgroundGeolocation.start();
    }

    /**
     * Returns the current location
     * @returns {json} the JSON encoding of the current location
     */
    async getCurrentLocation()
    {
        var latitude = this._latitude;
        var longitude = this._longitude;

        return { latitude, longitude };
    }

    /**
     * Get request
     * @param {string} userID - the user ID requested
     */
    async getLocation(userID) {
        console.log('userID at getLocation');
        console.log(userID);
        

        console.log(JSON.stringify({ userID }));

        const { status, responseText } = await fetch('GET', 
        API + '?userID=' + userID);

        switch (status) {
            case 200:
            case 201:
            case 204:
                break;
            case 401:
                throw new Error('Incorrect.');
            default:
                throw new Error('Unknown error occurred.');
        }
        var responseJSON = JSON.parse(responseText);
        console.log(responseJSON);
        console.log('responseText');
        //console.log({responseJSON.latitude, responseJSON.longitude});
        return { latitude: responseJSON.latitude, longitude: responseJSON.longitude };
    }

    startLocationUpdates(userID){
        navigator.geolocation.watchPosition(position => {
            console.log('Watching');
            this.updatePosition(position, userID);
        },
        error => console.log(JSON.stringify(error.message)),
        {
            enableHighAccuracy: true
        });
    }
}
Object.freeze(Location);


/**
  * Functions to add:
  * 
  * updateLocation(id, latitude, longitude)
  *    Will update the latitude and longitude of the user with the given id
  *    Will also update the list of user ids at latitude,longitude with this user if not already present
  *    requires isAuthenticated 
  * 
  * getLocation(id)
  *    Will return the latitude and longitude of the user with given id
  *   requires isAuthenticated
  * 
  * getUsersAt(latitude, longitude, epsilon = 0)
  *     Will return list of user ids at a certain latitude, longitude with some epsilon distance
  * 
  * stopLocationTracking()
  *     should stop tracking the user's location; will probably call at log out
  */
export default Location;