import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Button,
  AsyncStorage,
  
} from 'react-native';
import { WebBrowser } from 'expo';

import { MonoText } from '../components/StyledText';

import { func, shape, string } from 'prop-types';

import User from '../src/User';
import t from 'tcomb-form-native';
import Geolocation from '../src/Location';



export default class LoginScreen extends React.Component {
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

        this.state = {
            loading,
            username: '',
            password: '',
            message: null
        };
        this._onSubmit = this.onSubmit.bind(this);
        this._login = this.login.bind(this);
    }

    static navigationOptions = {
        title: 'Login'
    };

    render() {
        const {
            loading, message,
            username, password
        } = this.state;

        const Form = t.form.Form;

        const options = {
            username :
            {
                error: 'Please enter your username.'
            },
            password: {
                error: 'Please enter your password.'
            }
        }

        const Login = t.struct({
            username: t.String,
            password: t.String,
        });

        return (
        <View style={styles.container}>
            <Form ref={(c) => this._form = c} 
                type={Login}   
            />
            <Button
                title="Login"
                onPress={() => this._onSubmit()}
            />
            
        </View>
        ); 
    }

    _maybeRenderDevelopmentModeWarning() {
        if (__DEV__) {
        const learnMoreButton = (
            <Text onPress={this._handleLearnMorePress} style={styles.helpLinkText}>
            Learn more
            </Text>
        );

        return (
            <Text style={styles.developmentModeText}>
            Development mode is enabled, your app will be slower but you can use useful development
            tools. {learnMoreButton}
            </Text>
        );
        } else {
        return (
            <Text style={styles.developmentModeText}>
            You are not in development mode, your app will run at full speed.
            </Text>
        );
        }
    }

    _handleLearnMorePress = () => {
        WebBrowser.openBrowserAsync('https://docs.expo.io/versions/latest/guides/development-mode');
    };

    _handleHelpPress = () => {
        WebBrowser.openBrowserAsync(
        'https://docs.expo.io/versions/latest/guides/up-and-running.html#can-t-see-your-changes'
        );
    };

    async _componentDidMount() {
        if (!this.state.loading) {
            return;
        }

        await User.refreshLoginStatus();
        this.setState({
            loading: false,
            redirect: User.loggedIn
        });
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
     * Handles form submission.
     *
     * @private
     */
    async onSubmit(props) {
        //console.log(this._form);
        const value = this._form.getValue();
        console.log(value);
        this._login(value.username, value.password)
        await AsyncStorage.setItem('userToken', value.username)
        .then(() => {
            var location = new Geolocation();
            location.enableLocationPermission(value.username);
            this.props.navigation.navigate('Home');
        });
  }

    /**
     * Handles signup click.
     *
     * @private
     */
    _onSignupClick() {
        const { history } = this.props;
        const { referer } = this.locationState;

        const { username, password } = this.state;
        history.push('/signup/', {
            referer, username, password
        });
    }

    /**
     * Attempts to log in with the given credentials.
     *
     * @private
     * @param {string} username - The username.
     * @param {string} password - The password.
     * @returns {Promise} Resolves with `null` on success, or with an `Error` if
     * an error was handled.
     */
    async login(username, password) {
        try {
            await User.login(username, password);

            return null;
        } catch (err) {
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

