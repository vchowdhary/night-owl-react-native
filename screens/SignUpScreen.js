import React from 'react';
import * as yup from 'yup';
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
  Dimensions
} from 'react-native';
import {Button, Label, Input, Text, Slider} from 'react-native-elements';
import  Accordion from 'react-native-collapsible/Accordion';
import RNPickerSelect from 'react-native-picker-select';
import Swipeable from 'react-native-swipeable-row';
import { bold } from 'ansi-colors';


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
    this.removeFromTutoring = this.removeFromTutoring.bind(this);
    this.onTutoringChange = this.onTutoringChange.bind(this);
    this.onDeliveryChange = this.onDeliveryChange.bind(this);
    this.onTutoringNeedsChange = this.onTutoringNeedsChange.bind(this);
    this.onDeliveryNeedsChange = this.onDeliveryNeedsChange.bind(this);
    this.onChange = this.onChange.bind(this);
    
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

   /**
     * Handles tutoring form change
     * 
     * @param {string} name - the input name
     * @param {string} value - the description
     */
    onTutoringChange(name, value) {
      if(name.includes('/'))
      {
          var split = name.split('/');
          this.state.tutoring[[split[0]]][[split[1]]] = value;
          this.onChange('tutoring', this.state.tutoring);
      }
      else{
          this.state.tutoring[[name]] = value;
          this.onChange('tutoring', this.state.tutoring);
      }
      
  }

  /**
   * Handles tutoring form change
   * 
   * @param {string} name - the input name
   * @param {string} value - the description
   */
  onTutoringNeedsChange(name, value) {
      if(name.includes('/')){
          var split = name.split('/');
          this.state.tutoringNeeds[[split[0]]][[split[1]]] = value;
          this.onChange('tutoringNeeds', this.state.tutoringNeeds);
      }
      else{
          this.state.tutoringNeeds[[name]] = value;
          this.onChange('tutoringNeeds', this.state.tutoringNeeds);
      }
      
  }

  /**
   * Handles delivery form change
   * 
   * @param {string} name - the input name
   * @param {string} value - the description
   */
  onDeliveryNeedsChange(name, value) {
      // eslint-disable-next-line react/no-direct-mutation-state
      if (name.includes('/')){
          var split = name.split('/');
          this.state.deliveryNeeds[[split[0]]][[split[1]]] = value;
          this.onChange('deliveryNeeds', this.state.deliveryNeeds);
      }
      else{
          this.state.deliveryNeeds[[name]] = value;
          this.onChange('deliveryNeeds', this.state.deliveryNeeds);
      }
  }

  /**
   * Handles delivery form change
   * 
   * @param {string} name - the input name
   * @param {string} value - the description
   */
  onDeliveryChange(name, value) {
      if(name.includes('/')){
          var split = name.split('/');
          this.state.delivery[[split[0]]][[split[1]]] = value;
          this.onChange('delivery', this.state.delivery);
      }
      else{
          this.state.delivery[[name]] = value;
          this.onChange('delivery', this.state.delivery);
      }
      
  }

  onChange(key, value) {
    this.setState({ [key]: value });
    //console.log(this.state);
}

  Subject(props){
    console.log("Creating Subject");
    
    const { name } = props;
    console.log(name);
    console.log("Init value");
    console.log(this.state.tutoring[[name]]);
    var rvalue = this.state.tutoring[[name]] === undefined ? 1 : this.state.tutoring[[name]]["rating"];
    console.log(rvalue);
    return (
      <View>
        <Text h5>{(props.name).toUpperCase()}</Text>
        <Input
          onChangeText={(value) => { 
            this.onTutoringChange(name+'/rating', parseInt(value))}}
          value={1}
          label={"RATE YOUR SKILL FROM 1 (BEGINNER) to 5 (EXPERT)"}
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
    this.state.tutoringRows.push({label: subject, value: subject});
    this.state.tutoring[[subject]] = {rating: 1, details: '', preference: 1};
    
    if (this.state.selectedsubject == "Other"){
      this.pushToDatabase(this.state.newTutoringSubject, 'tutoring');
      this.state.tutoringSubjects.push({label: this.state.newTutoringSubject, 
                                        value: this.state.newTutoringSubject});
      this.state.tutoring[[this.state.newTutoringSubject]] = {rating: 1, details: '', preference: 1};
    }

    this.setState({tutoring: this.state.tutoring});
    this.setState({tutoringSubjects: this.state.tutoringSubjects});
    console.log(this.state);

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

  removeFromTutoring(subjectname, index)
  {
    delete this.state.tutoring[[subjectname]];
    this.state.tutoringRows.splice(index, 1);
    this.setState({tutoring: this.state.tutoring, tutoringRows: this.state.tutoringRows});
    console.log(this.state);
  }

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
                    const rightButtons = [
                      <TouchableHighlight 
                      style = {{backgroundColor: '#e20000', flex: 1,  alignContent: 'center'}}
                      onPress={({idex}) => this.removeFromTutoring(item.label, index)}><Text style={{
                        color: '#fff'
                      }}>DELETE</Text></TouchableHighlight>,
                    ];
                    console.log("Rendering");
                    console.log(item);
                    console.log(index);
                    return (<Swipeable rightButtons={rightButtons}>
                              <this.Subject name={item.label}/>
                            </Swipeable>);}
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