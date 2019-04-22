/**
 * Module for representing user state.
 *
 * @module src/User
 */

import XHRpromise from '../XHRpromise';
//import Geolocation from '../Location';
import Map from '../Map';

/**
 * API base path.
 *
 * @private
 * @readonly
 * @type {string}
 */
const API = '/api/users/';
const API2 = '/api/tokens/';
import config from '../../config';


console.log(config);
const url = config.url;

//'http://128.237.220.65:4500'

/**
 * Paths associated with the user interface.
 *
 * @private
 * @readonly
 * @enum {string}
 */
const UIPaths = {
    /** Login UI. */
    login: '/login/',
    map: '/map/'
};
Object.freeze(UIPaths);

/**
 * Represents user state.
 *
 * @private
 */
class User {
    /**
     * Initializes the authentication state.
     */
    constructor() {
        Object.defineProperties(this, /** @lends User# */ {
            /**
             * ID if logged in; `false` if not logged in; `null` if
             * unknown (i.e., initial refresh not performed).
             *
             * @private
             * @type {(string?|boolean)}
             */
            _id: { value: null, writable: true },

            /**
             * The current login refresh promise, or `null`.
             *
             * @private
             * @type {Promise?}
             */
            _refreshLoginStatusPromise: { value: null, writable: true },
            /**
             * Location enabled
             * @private
             * @type {boolean}
             */
            _location: { value: null, writable: true },
            /**
             * FCM Registration token
             * @public
             * @type {string}
             */
            _token: { value: null, writable: true },
            /**
             * pushes token
             * @private
             * @type {Promise}
             */
            _pushToken: { value: null, writable: true }
        });
    }

    /**
     * Paths associated with the user interface.
     *
     * @readonly
     * @see module:src/Users~UIPaths
     */
    get paths() {
        return UIPaths;
    }

    /**
     * `true` if logged in; `false` if not logged in; `null` if
     * unknown (i.e., initial refresh not performed).
     *
     * @readonly
     * @type {boolean?}
     */
    get loggedIn() {
        return this.id === null
            ? null
            : !!this.id;
    }

    /**
     * ID if logged in; `false` if not logged in; `null` if
     * unknown (i.e., initial refresh not performed).
     *
     * @readonly
     * @type {(string?|boolean)}
     */
    get id() {
        return this._id;
    }

    /**
     * Sets token
     * @param {string} token - sets the token
     */
    async token(token){
        console.log('Setting token');
        this._token = token;
        if(this.loggedIn){
            console.log('Logged in');
            const token = this._token;
            console.log(token);
            const id = this._id;
            console.log(id);


            const { status } = await XHRpromise('PUT', API2, {
                contentType: 'application/json',
                body: JSON.stringify({ id, token })
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
        }
    }

    /**
     * Refreshes the login status.
     *
     * If an existing refresh request is in progress, its promise is returned
     * instead.
     *
     * @returns {Promise} Resolves with the user instance on completion, or
     * rejects with an error.
     */
    refreshLoginStatus() {
        if (this._refreshLoginStatusPromise) {
            return this._refreshLoginStatusPromise;
        }

        this._refreshLoginStatusPromise = (async() => {
            try {
                const {
                    status, responseText
                } = await XHRpromise('GET', url + API);

                if (status === 200) {
                    const { id } = JSON.parse(responseText);
                    this._id = id;
                } else {
                    this._id = false;
                }
            } finally {
                this._refreshLoginStatusPromise = null;
            }
        })();
        return this._refreshLoginStatusPromise;
    }

    /**
     * Attempts to log in.
     *
     * @param {string} id - The login ID.
     * @param {string} password - The password.
     * @returns {module:src/User} Resolves with the user instance on success, or
     * rejects with an error.
     */
    async login(id, password) {
        if (this.loggedIn) {
            return this;
        }
        console.log('logging in');
        console.log(id);
        console.log(password);
        
        await fetch(url + API, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                username: id,
                password: password
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
       
        this._id = id;
        this._location = new Geolocation();
        this._map = new Map();
        this._location.enableLocationPermission(this._id);
        this.token(this._token);

        return this;
    }

    /**
     * Attempts to log out.
     *
     * @returns {module:src/User} Resolves with the user instance on success, or
     * rejects with an error.
     */
    async logout() {
        await fetch(url + API, {
            method: 'delete'
          })
          .then(response => console.log(response.body));

        this._id = false;
        return this;
    }

    /**
     * Attempts to sign up a new user.
     *
     * @param {string} id - The login ID.
     * @param {string} password - The password.
     * @param {string} profile - Profile information.
     * @returns {module:src/User} Resolves with the user instance on success, or
     * rejects with an error.
     */
    async signup(id, password, profile) {
        console.log(id);
        const reqURL = `${url + API}/${encodeURIComponent(id)}`;

        console.log(id);
        console.log(password);
        console.log(profile);
        
        await fetch(reqURL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
              },
            body: JSON.stringify({ password, profile }),
        })
        .then(res => {
            console.log(res.status)
            if (res.status === 201){
                console.log('Success!!');
                this._id = id;
                return this;
            }
        })
        .catch((error) => {
            console.log(error);
            return error;
        });

    }

    /**
     * Attempts to delete the logged-in user.
     *
     * @returns {module:src/User} Resolves with the user instance on success, or
     * rejects with an error.
     */
    async delete() {
        const id = this._id;
        if (!id) {
            throw new Error('Cannot delete account while not logged in!');
        }

        const reqURL = `${url + API}/${encodeURIComponent(id)}`;

        const { status } = await XHRpromise('DELETE', reqURL);

        switch (status) {
            case 200:
            case 204:
                break;
            default:
                throw new Error('Unknown error occurred.');
        }

        this._id = false;
        return this;
    }

    /**
     * Update user profile
     * @param {id} id - user id
     * @param {JSON} profile - new profile
     */
    async update(id, profile){
        const reqURL = `${url + API}/${encodeURIComponent(id)}`;

        console.log(id);
        console.log(profile);
        
        await fetch(reqURL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ profile, update: true }),
        })
        .then(res => {
            console.log(res.status)
            if (res.status === 201 || res.status === 200){
                console.log('Success!!');
            }
        })
        .catch((error) => {
            console.log(error);
            return error;
        });

        this._id = id;
        return this;
    }
}

Object.freeze(User);

/**
 * User state singleton.
 *
 * @alias module:src/User
 * @type {module:src/User~User}
 */
const state = new User();
export default state;

