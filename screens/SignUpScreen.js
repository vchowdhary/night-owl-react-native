import React from 'react';
import * as yup from 'yup';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
  Alert,
  Picker,
  FlatList,
  Dimensions
} from 'react-native';
import {Button, Label, Input, Text, Slider} from 'react-native-elements';
import  Accordion from 'react-native-collapsible/Accordion';
import RNPickerSelect from 'react-native-picker-select';
import Subject from './Subject';


const url = 'http://128.237.113.186:4500';
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
      },
      activeSections: [],
      tutoringRows: [],
      newTutoringSubject: ''
    }

    this.onChange = this.onChange.bind(this);
    this.renderTutoringSubjects = this.renderTutoringSubjects.bind(this);
    this._form = null;
    this._renderContent = this._renderContent.bind(this);
    this._renderHeader = this._renderHeader.bind(this);
    this._renderSectionTitle = this._renderSectionTitle.bind(this);
    this._updateSections = this._updateSections.bind(this);
    this.SECTIONS = this.SECTIONS.bind(this);
    this.Subject = this.Subject.bind(this);
    this.addTutoringSubject = this.addTutoringSubject.bind(this);
    this.pushToDatabase = this.pushToDatabase.bind(this);
    
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
                return {label: x["subject"], value: x["subject"]}
              });
              subjects.push({label: "Other", value: "Other"});
              console.log(subjects);
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

  renderTutoringSubjects(){
    const placeholder = {
      label: 'Select a subject...',
      value: null,
      color: '#9EA0A4',
    };
    return (
      <RNPickerSelect
          placeholder={placeholder}
          items={this.state.tutoringSubjects}
          onValueChange={value => {
            this.setState({
              selectedsubject: value,
            });
          }}
          value={this.state.selectedsubject}
          style={{
            ...pickerSelectStyles,
            placeholder: {
              color: 'gray',
              fontSize: 12,
              fontWeight: 'bold',
            },
          }}
        />
    );
  }

  Subject(props){
    console.log("Creating Subject");
    
    const { name } = props;
    console.log(props);
    console.log(this.state.tutoring[[name]]);
    return (
      <View>
        <Text h4>{(props.name).toUpperCase()}</Text>
        <Text h5>Rate your skill from 1 to 5, with 1 being beginner and 5 being expert</Text>
        <Text style={{
                width: 50,
                textAlign: 'center',
                }}
            >{Math.floor( this.state.tutoring[[name]]["rating"] )}</Text>
        <Slider
          value={this.state.tutoring[[name]]["rating"] !== undefined ? this.state.tutoring[[name]]["rating"] : 0}
          onValueChange={value => {
            var x = this.state.tutoring[[name]];
            x.rating = value;
            this.setState({tutoring: this.state.tutoring});
          }}
          step={1}
          minimumValue={1}
          maximumValue={5}
        />
      </View>);
  }

  /**
     * Pushes new subject to the subject database
     * @param {name} name - name of new subject
     * @param {string} service - key of service
     */
    async pushToDatabase(name, service){
      console.log('Pushing subjects');
      await fetch(url + API, {
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

  addTutoringSubject(){
    console.log("pressed");
    var x = this.state.tutoringRows;
    var subject = this.state.selectedsubject === "Other" ? this.state.newTutoringSubject : this.state.selectedsubject;
    x.push(subject);
    this.setState({tutoringRows: x});
    this.state.tutoring[subject] = {rating: 0, details: '', preference: 0};
    this.setState({tutoring: this.state.tutoring});
    console.log(this.state);
    if (this.state.selectedsubject == "Other"){
      this.pushToDatabase(this.state.newTutoringSubject, 'tutoring');
      this.state.tutoringSubjects.push(this.state.newTutoringSubject);
    }

  }

  onChange(value, field){
    console.log('Changed');
    console.log(value);
    console.log(field);
  }
    _renderSectionTitle = section => {
      return null;
    };
  
    _renderHeader = section => {
      return (
        <View style={styles.header}>
          <Text style={styles.headerText}>{section.title}</Text>
        </View>
      );
    };
  
    _renderContent = section => {
      return (
        <View style={styles.content}>
          {section.content}
        </View>
      );
    };
  
    _updateSections = activeSections => {
      this.setState({ activeSections });
    };

  SECTIONS(){
    const dimensions = Dimensions.get('window');
    const screenWidth = dimensions.width;
    return [
      {
        title: 'TUTORING SKILLS',
        content: <View>
          <Text h5>Please describe your tutoring skills. </Text>
              {this.renderTutoringSubjects()}
          <Input
            onChangeText={(value) => { this.setState({newTutoringSubject: value})}}
            value={this.state.newTutoringSubject}
            label={"NEW SUBJECT"}
            editable={this.state.selectedsubject === "Other"}
          />
          <Button onPress={this.addTutoringSubject} title="Add Subject" />
          <ScrollView>
            <FlatList
                  data={this.state.tutoringRows}
                  style={{
                    flex: 1,
                  }}
                  renderItem={({ item, index }) => 
                  {
                    console.log("Rendering");
                    console.log(item);
                    console.log(index);
                    return (<this.Subject name={item}/>);}
                }
            />
          </ScrollView>
        </View>,
      },
      {
        title: 'DELIVERY SKILLS',
        content: <Text h5>''</Text>,
      },
      {
        title: 'TUTORING NEEDS',
        content: <Text h5>''</Text>,
      },
      {
        title: 'DELIVERY NEEDS',
        content: <Text h5>''</Text>,
      }
    ];
  }

  render() {
  
  
    return (
      <ScrollView styles={styles.welcomeContainer}>
          <Input
              onChangeText={(value) => { this.setState({firstName: value})}}
              value={this.state.firstName}
              label={"FIRST NAME"}
          />
           <Input
              onChangeText={(value) => { this.setState({lastName: value})}}
              value={this.state.lastName}
              label={"LAST NAME"}
          />
          <Input
              onChangeText={(value) => { this.setState({phone: value})}}
              value={this.state.phone}
              label={"PHONE"}
          />
          <Accordion
          sections={this.SECTIONS()}
          activeSections={this.state.activeSections}
          renderSectionTitle={this._renderSectionTitle}
          renderHeader={this._renderHeader}
          renderContent={this._renderContent}
          onChange={this._updateSections}
          />
          <Button onPress={(value) => {console.log(value)}} title="Submit" />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  headerText: {
    color: '#fff',
    fontSize: 16
  },
  header: {
    backgroundColor: '#a6aebc',
    padding: 10
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