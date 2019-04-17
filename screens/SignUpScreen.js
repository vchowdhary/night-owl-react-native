import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Button
} from 'react-native';
import { WebBrowser } from 'expo';
import t from 'tcomb-form-native';

import { MonoText } from '../components/StyledText';

const url = 'http://128.237.192.56:4500';
const API = '/api/subjects';

const Form = t.form.Form;

export default class SignUpScreen extends React.Component {
  constructor(props){
    super(props);

    this.state =
    {
      tutoringSubjects: t.enums({}),
      deliveryCategories: t.enums({}),
      options: {}
    }
    
  }
  static navigationOptions = ({ navigation }) => {
      return {
        title: "Sign Up",
      headerLeft: (
        <Button
          title="Cancel"
          onPress={() => navigation.navigate('Login')}
        />
      ),
    };
  }

  /**
     * runs when component will mount
     */
    async componentWillMount() {
      this.renderDropdown('tutoringSubjects');
      console.log('Getting delivery categories');
      this.renderDropdown('deliveryCategories');
  }

  /**
  * Fetches options from database
  * @param {string} key - key for service
  */
  async renderDropdown(key) {
      console.log('Getting subjects');
      await fetch(url + API + '?service=' + key, {
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
                return x["subject"]
              });
              console.log(subjects);
              subjects = subjects.reduce(function(map, obj) {
                map[obj] = obj;
                return map;
              }, {});
              this.setState({ [key]: t.enums(subjects) });
            }
            else{
              console.log("Categories");
              var old = JSON.parse(res._bodyText);
              var subjects = old.map((x) => {
                return x["category"]
              });
              console.log(subjects);
              subjects = subjects.reduce(function(map, obj) {
                map[obj] = obj;
                return map;
              }, {});
              this.setState({ [key]: t.enums(subjects) });
            }
            
        }
    })
    .catch((error) => {
        console.log(error);
        return error;
    });

  }

  render() {
    const options = {
      username :
      {
          error: 'Please enter your username.'
      },
      password: {
          error: 'Please enter your password.'
      }
    }
    
    const TutoringSkills = t.struct({
      subjects: this.state.tutoringSubjects
    })
    
    const Info = t.struct({
        firstName: t.String,
        lastName: t.String,
        phoneNumber: t.String,
        andrewId: t.String,
        password: t.String,
        tutoringSkills: TutoringSkills
    });
  
    return (
      <View style={styles.container}>
            <Form ref={(c) => this._form = c} 
                type={Info} 
                options={this.state.options}  
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
}

const styles = StyleSheet.create({
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
});
