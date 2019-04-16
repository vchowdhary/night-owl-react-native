import XHRpromise from '../XHRpromise';
/**
 * API base path.
 *
 * @private
 * @readonly
 * @type {string}
 */
const API = '/api/locationtracking/';

/**
 * Handles all location tracking
 * @private
 */
class Geolocation{
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
    }

    /**
     * Inserts position into database.
     * 
     * @param {string} position - the position from watchPosition
     * @param {string} userID - the userID
     */
    async updatePosition(position, userID){
        console.log(position.coords);
        console.log(userID);
        //console.log(typeof position);

        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        this._latitude = position.coords.latitude;
        this._longitude = position.coords.longitude;

        console.log('User id:');
        console.log(userID);

        const { status } = await XHRpromise('PUT', API, {
            contentType: 'application/json',
            body: JSON.stringify({ latitude, longitude, userID })
        });

        switch (status) {
            case 200:
            case 201:
            case 204:
                break;
            case 401:
                throw new Error('Incorrect username/password.');
            default:
                throw new Error('Unknown error occurred.');
        }

        //Map.updateMap(latitude, longitude);
        //this._id = id;
        return this;
    }

    /** 
     * Authorizes location tracking
     * @param {string} userID - the user id 
     */
    async enableLocationPermission(userID){
        if(this._enabled)
        {
            return;
        }
        navigator.geolocation.watchPosition(
            position => {
                console.log('Updating');
                //console.log(id);
                this.updatePosition(position, userID);
                //console.log(this.getLocation(userID));
            },
            error => console.log(JSON.stringify(error.message)),
            {
                enableHighAccuracy: true
            }
        );

        this._enabled = true;
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

        const { status, responseText } = await XHRpromise('GET', API + '?userID=' + userID);

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
export default Geolocation;