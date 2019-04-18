import React from 'react';
import * as yup from 'yup';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import {Button, Label, Input} from 'react-native-elements';
import { Formik, Field } from 'formik';

const url = 'http://128.237.183.228:4500';
const API = '/api/subjects';


export default class SignUpScreen extends React.Component {
  constructor(props){
    super(props);

    this.state =
    {
      tutoringSubjects: [],
      deliveryCategories: [],
      options: {},
      value: {},
      selectedsubject: '',
      firstName: '',
      lastName: '',
      phone: '',
      tutoring: {
        timetotutor: 0,
      },
      delivery:
      {
        timetodeliver: 0,
        timetopickup: 0,
      },
      tutoringNeeds: {
        timetogettutored: 0
      },
      deliveryNeeds: {
        timetopickup: 0
      }

    }

    this.onChange = this.onChange.bind(this);
    this._form = null;
    
  }
  static navigationOptions = ({ navigation }) => {
      return {
        title: "Sign Up",
      headerLeft: (
        <Button
          title="Cancel"
          onPress={() => navigation.navigate('Login')}
          type="clear"
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
              subjects.push("Other");
              console.log(subjects);
              this.setState({ [key]: subjects });
            }
            else{
              console.log("Categories");
              var old = JSON.parse(res._bodyText);
              var subjects = old.map((x) => {
                return x["category"]
              });
              subjects.push("other");
              this.setState({ [key]: subjects });
            }
            
        }
    })
    .catch((error) => {
        console.log(error);
        return error;
    });

  }

  onChange(value, field){
    console.log('Changed');
    console.log(value);
    console.log(field);
  }

  render() {
    return (
      <View styles={styles.welcomeContainer}>
          <Input
              onChangeText={(value) => { this.setState({firstName: value})}}
              value={this.state.firstName}
              label={"FIRST NAME"}
              errorMessage={"First name is required"}
          />
           <Input
              onChangeText={(value) => { this.setState({firstName: value})}}
              value={this.state.lastName}
              label={"LAST NAME"}
              errorMessage={"Last name is required"}
          />
          <Button onPress={(value) => {console.log(value)}} title="Submit" />
      </View>
    );
  }
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
