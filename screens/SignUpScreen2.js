/* eslint-disable object-curly-spacing */
/**
 * Signup page.
 *
 * @module src/routes/signup
 */

import React from 'react';
import {View} from 'react-native';

import User from '../src/User';

import Basic from '../src/routes/signup/Basic';
import Profile from '../src/routes/signup/Profile';
import Account from '../src/routes/signup/Account';



/**
 * Signup page.
 *
 * @alias module:src/routes/signup
 */
export default class SignUpScreen extends React.Component {
    /**
     * Initializes the component.
     *
     * @param {Object} props - The component's props.
     */
    constructor(props) {
        super(props);

        const { loggedIn } = User;

        const loading = loggedIn === null;
        const redirect = loggedIn === true;

        const {
            username,
            password
        } = this.locationState;

        this.state = {
            loading,
            redirect,
            message: null,
            username,
            password,
            tutoring: {},
            delivery: {},
            tutoringNeeds: {},
            deliveryNeeds: {}
        };

        [
            'onAccountSubmit',
            'onChange'
        ].forEach(key => {
            this[key] = this[key].bind(this);
        });

        if (loading) {
            (async() => {
                await User.refreshLoginStatus();
                this.setState({
                    loading: false,
                    redirect: User.loggedIn
                });
            })();
        }
    }

    /**
     * The current location state.
     *
     * @private
     * @readonly
     * @type {Object}
     */
    get locationState() {
        const { location } = this.props;

        return location.state || {
            referer: { pathname: location.pathname }
        };
    }

    /**
     * Handles account form submission.
     *
     * @private
     */
    onAccountSubmit() {
        const { username, password, ...profile } = this.state;
        delete profile.loading;
        delete profile.redirect;
        delete profile.message;

        this.setState({ loading: true });
        this.signup(username, password, profile);
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
     * Renders the component.
     *
     * @returns {ReactElement} The component's elements.
     */
    render() {
        const {
            onAccountSubmit,
            onChange
        } = this;

        const {
            loading,
            message,
            ...data
        } = this.state;

        delete data.redirect;

        return <View className={styles.signup}>
            <Basic
                disabled={loading}
                onChange={onChange}
                {...data}
            />
            <Profile 
                disabled={loading}
                onChange={onChange}
                {...data}
            />
            <Account
                disabled={loading}
                onSubmit={onAccountSubmit}
                onChange={onChange}
                message={message}
                {...data}
            />
        </View>;
    }

    /**
     * Attempts to sign up with the given account information.
     *
     * @private
     * @param {string} username - The username.
     * @param {string} password - The password.
     * @param {Object} profile - Profile information.
     * @returns {Promise} Resolves with `null` on success, or with an `Error` if
     * an error was handled.
     */
    async signup(username, password, profile) {
        try {
            await User.signup(username, password, profile);

            this.setState({ loading: false, redirect: true, message: null });

            return null;
        } catch (err) {
            const message = <p className={styles.error}>
                Signup failed: {err.message}
            </p>;

            this.setState({ loading: false, message });

            return err;
        }
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      paddingTop: 20,
      paddingLeft: 15,
      paddingRight: 15
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
      display: 'flex',
      flexFlow: 'row wrap',
      alignItems: 'center'
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
  });
