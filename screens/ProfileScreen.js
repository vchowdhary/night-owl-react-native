import React from 'react';
import User from '../src/User';
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
  Dimensions,
  AsyncStorage,
} from 'react-native';
import {Button, Label, Input, Text, Slider} from 'react-native-elements';
import  Accordion from 'react-native-collapsible/Accordion';
import RNPickerSelect from 'react-native-picker-select';
import Swipeable from 'react-native-swipeable-row';
import { bold } from 'ansi-colors';


const url = 'http://128.237.136.103:4500';
const API = '/api/subjects';


export default class ProfileScreen extends React.Component {
  constructor(props){
    super(props);

    this.state =
    {
      tutoringSubjects: [],
      deliveryCategories: [],
      options: {},
      value: {},
      selectedsubject: '',
      selectedcategory: '',
      selectedsubjectneed: '',
      selectedcategoryneed: '',
      nameFirst: '',
      nameLast: '',
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
      tutoringRowsNeed: [],
      deliveryRows: [],
      deliveryRowsNeed: [],
      newTutoringSubject: '',
      newDeliveryCategory: '',
      newTutoringSubjectNeed: '',
      newDeliveryCategoryNeed: '',
      disabled: true,
      loading: true,
      error: null,
      profile: {tutoring: {}, delivery: {}, deliveryNeeds: {}, tutoringNeeds: {}, bio: ''},
    }

    this.onChange = this.onChange.bind(this);
    this.renderDropdownService = this.renderDropdownService.bind(this);
    this._form = null;
    this._renderContent = this._renderContent.bind(this);
    this._renderHeader = this._renderHeader.bind(this);
    this._renderSectionTitle = this._renderSectionTitle.bind(this);
    this._updateSections = this._updateSections.bind(this);
    this.SECTIONS = this.SECTIONS.bind(this);
    this.Subject = this.Subject.bind(this);
    this.addItem = this.addItem.bind(this);
    this.pushToDatabase = this.pushToDatabase.bind(this);
    this.removeFromService = this.removeFromService.bind(this);
    this.onTutoringChange = this.onTutoringChange.bind(this);
    this.onDeliveryChange = this.onDeliveryChange.bind(this);
    this.onTutoringNeedsChange = this.onTutoringNeedsChange.bind(this);
    this.onDeliveryNeedsChange = this.onDeliveryNeedsChange.bind(this);
    this.onChange = this.onChange.bind(this);
    this.Category = this.Category.bind(this);
    this.onAccountSubmit = this.onAccountSubmit.bind(this);
    this.signup = this.signup.bind(this);
    this.refreshProfile = this.refreshProfile.bind(this);
    this.updateRows = this.updateRows.bind(this);
    this.onEditClick = this.onEditClick.bind(this);
    
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
     * Edit button clicked
     */
    async onEditClick(){
      if(!this.state.disabled){
          this.state.profile.tutoring = this.state.tutoring;
          this.state.profile.delivery = this.state.delivery;
          this.state.profile.deliveryNeeds = this.state.deliveryNeeds;
          this.state.profile.tutoringNeeds = this.state.tutoringNeeds;
          this.state.profile.bio = this.state.bio;

          console.log('Updating profile...');
          console.log(this.state.id);
          await User.update(this.state.id, this.state.profile);
      }
      this.setState({ disabled: !this.state.disabled });
      
  }

  async refreshProfile() {
    console.log('Refreshing profile');
    const id = await AsyncStorage.getItem("userToken");
    console.log(id);
    const reqURL = url + `/api/users/${encodeURIComponent(id)}`;

    this.setState({ loading: true, id: id });

    try {
        await fetch(reqURL, {
            method: 'GET'
        })
        .then(res => {
          console.log(res.status)
          //console.log(res._bodyText);
          if (res.status === 200){
              console.log('Success!!');
              console.log(res._bodyText);
              var profile = JSON.parse(res._bodyText);
              console.log(profile);
              this.setState({ profile: profile });
              this.setState({ 
                  id: id,
                  tutoring: profile.tutoring, 
                  tutoringNeeds: profile.tutoringNeeds, 
                  delivery: profile.delivery,
                  deliveryNeeds: profile.deliveryNeeds,
                  bio: profile.bio
            });
            console.log(this.state);
            this.updateRows();
        }})
        .catch((error) => {
            console.log(error);
            return error;
        });      

      
        
        

    } catch (error) {
        this.setState({ error });
    } finally {
        this.setState({ loading: false });
    }
}

updateRows(){
  console.log('Updating rows');
  for (var key in this.state.tutoring){
      console.log(key);
      if(key !== 'timetotutor'){
          this.state.tutoringRows.push({ label: key });
      }
  }

  for (var key2 in this.state.tutoringNeeds){
      console.log(key2);
      if(key2 !== 'timetogettutored'){
          this.state.tutoringRowsNeed.push({ label: key2 });
      }
  }
  
  for (var key3 in this.state.delivery){
      console.log(key3);
      if(key3 !== 'timetodeliver' && key3 !== 'timetopickup'){
          this.state.deliveryRows.push({ label: key3 });
      }
  }

  for (var key4 in this.state.deliveryNeeds){
      console.log(key4);
      if(key4 !== 'timetopickup'){
          this.state.deliveryRowsNeed.push({ label: key4 });
      }
  }
  console.log(this.state);
}

/**
 * React lifecycle handler called when component has mounted.
 */
async componentDidMount() {
  if (!this.state.loading) {
      return;
  }

  this.refreshProfile();
  
  //await this.refreshMatchIDs();
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

  renderDropdownService(service, need){
    const placeholder = {
      label: service === "tutoring" ? 'Select a subject...' : 'Select a category...',
      value: null,
      color: '#9EA0A4',
    };
    var selection = service === "tutoring" ? "selectedsubject" : "selectedcategory";
    selection = need ? selection + "need" : selection;

    var items = service==="tutoring" ? 'tutoringSubjects' : 'deliveryCategories';
    //console.log(this.state[[items]])

    return (
      <RNPickerSelect
          placeholder={placeholder}
          items={this.state[[items]]}
          onValueChange={value => {
            this.state[[selection]] = value;
            this.setState(this.state);
            console.log(this.state);
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
    console.log(this.state);
}

  Subject(props){
    console.log("Creating Subject");
    
    const { name, need } = props;
    
    const ratings = [
      {label: "Novice", value: 1},
      {label: "Beginner", value: 2},
      {label: "Intermediate", value: 3},
      {label: "Above Average", value: 4},
      {label: "Expert", value: 5}
    ]
    const preferences = [
      {label: "Strongly Dislike", value: 1},
      {label: "Dislike", value: 2},
      {label: "Neutral", value: 3},
      {label: "Like", value: 4},
      {label: "Strongly Like", value: 5}
    ]

    const needs = [
      {label: "Not At All", value: 1},
      {label: "Some", value: 2},
      {label: "Average", value: 3},
      {label: "Above Average", value: 4},
      {label: "Highly Need", value: 5}
    ]

    console.log(name);
    console.log("Init value");
    console.log(this.state.tutoring[[name]]);
    return (
      <View style={styles.subject}>
        <Text style={styles.biglabelText}>{(props.name).toUpperCase()}</Text>
        {!need ?
          <View>
            <Text style={styles.labelText}>Please rate your skill in this subject</Text>
            <RNPickerSelect
              placeholder={{
                value: (this.state.tutoring[[name]['rating']]),
                color: '#9EA0A4',
              }}
              disabled={this.state.disabled}
              items={ratings}
              onValueChange={value => {
                this.onTutoringChange(name+'/rating', value)
              }}
              style={{
                ...pickerSelectStyles,
                placeholder: {
                  color: 'gray',
                  fontSize: 12,
                  fontWeight: 'bold',
                }
              }}/>
            </View>
            :
            <View></View>
        }
        <Text style={styles.labelText}>{!need ? 'Please rate how much you like teaching this subject.' : 'Please rate how much you need tutoring in this subject.'}</Text>
        <RNPickerSelect
            disabled={this.state.disabled}
            placeholder={{
              value: (need ? this.state.tutoringNeeds[[name]]['preference'] :
              this.state.tutoring[[name]]['preference']),
              color: '#9EA0A4',
            }}
            items={need ? needs : preferences}
            onValueChange={value => {
              need ? this.onTutoringNeedsChange(name+'/preference', value) : this.onTutoringChange(name+'/preference', value)
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
        <Input
          editable={this.state.disabled}
          style={styles.input}
          value={need ? this.state.tutoringNeeds[[name]]['details'] : this.state.tutoring[[name]]['details']}
          onChangeText={(value) => { 
            need ? this.onTutoringNeedsChange(name+'/details', value) : this.onTutoringChange(name+'/details', value)}}
          label={"ADDITIONAL DETAILS"}
        />
      </View>);
  }

  Category(props){
    console.log("Creating category");
    
    const { name, need } = props;
    const preferences = [
      {label: "Strongly Dislike", value: 1},
      {label: "Dislike", value: 2},
      {label: "Neutral", value: 3},
      {label: "Like", value: 4},
      {label: "Strongly Like", value: 5}
    ]
    console.log(name);
    console.log("Init value");
    return (
      <View style={styles.subject}>
        <Text style={styles.biglabelText}>{(props.name).toUpperCase()}</Text>
        <Text style={styles.labelText}>{need ? 'Please rate how much you would like to have this item delivered to you.' : 'Please rate how much you would like to deliver this item.'}</Text>
        <RNPickerSelect
            disabled={this.state.disabled}
            placeholder={{
              value: (need ? this.state.deliveryNeeds[[name]]['preference'] : this.state.delivery[[name]]['preference']),
              color: '#9EA0A4',
            }}
            items={preferences}
            onValueChange={value => {
              need? this.onDeliveryNeedsChange(name+'/preference', value) : this.onDeliveryChange(name+'/preference', value)
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
           <Input
              editable={this.state.disabled}
              style={styles.input}
              value={need ? this.state.deliveryNeeds[[name]]['details'] : this.state.delivery[[name]]['details']}
              onChangeText={(value) => { 
                need ? this.onDeliveryNeedsChange(name+'/details', value) : this.onDeliveryChange(name+'/details', value)}}
              label={"ADDITIONAL DETAILS"}/>
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

  addItem(service, need){
    console.log("pressed");
    var x = service === "tutoring" ? "tutoringRows" : "deliveryRows";
    x = need ? x + "Need" : x;
    var dataRows = this.state[[x]];

    var serviceID = need ? service + 'Needs' : service;

    var selection = service === 'tutoring' ? 'selectedsubject' : 'selectedcategory';
    selection = need ? selection + 'need' : selection;

    var newsubject = service === 'tutoring' ? 'newTutoringSubject' : 'newDeliveryCategory';
    newsubject = need ? newsubject + 'Need' : newsubject;

    var subject = this.state[[selection]] == "Other" ? this.state[[newsubject]] : this.state[[selection]];

    dataRows.push({label: subject, value: subject});
    this.state[[serviceID]][[subject]] = {rating: 1, details: '', preference: 1};
    
    if (this.state[[selection]] == "Other"){
      this.pushToDatabase(this.state[[newsubject]], service);
    }

    var subjects = service === "tutoring" ? "tutoringSubjects" : "deliveryCategories";

    this.setState({[serviceID]: this.state[[serviceID]]});
    this.setState({[subjects]: this.state[[subjects]]});
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

  removeFromService(subjectname, index, service, need)
  {
    var rows = service === 'tutoring' ? 'tutoringRows' : 'deliveryRows';
    rows = need ? rows + 'Need' : rows;

    var dataRows = this.state[[rows]];

    var items = need ? service + 'Needs' : service;

    delete this.state[[items]][[subjectname]];
    dataRows.splice(index, 1);

    this.setState({[[items]]: this.state[[items]], [items+'Rows']: dataRows});
    console.log(this.state);
  }

  SECTIONS(){
    const dimensions = Dimensions.get('window');
    const screenWidth = dimensions.width;
    const times = [
      {label: "5 minutes", value: 5},
      {label: "10 minutes", value: 10},
      {label: "15 minutes", value: 15},
      {label: "20 minutes", value: 20},
      {label: "25 minutes", value: 25},
      {label: "30 minutes", value: 30}
    ]
    return [
      {
        title: 'TUTORING SKILLS',
        content: <View>
          <Text style={styles.biglabelText}>Please describe your tutoring skills. </Text>
          <Text style={styles.labelText}>How far are away are you willing to go to tutor someone?</Text>
          <RNPickerSelect
            placeholder={{
              label: this.state.tutoring['timetotutor'] + " minutes",
              value: this.state.tutoring['timetotutor'],
              color: '#9EA0A4',
            }}
            items={times}
            disabled={this.state.disabled}
            onValueChange={(value) => {
              this.onTutoringChange('timetotutor', value)
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
          <Text style={styles.labelText}>Please select and describe your skills in each subject below.</Text>
              {this.renderDropdownService("tutoring", false)}
          <Input 
            style={styles.input}
            onChangeText={(value) => { this.setState({newTutoringSubject: value})}}
            value={this.state.newTutoringSubject}
            label={"NEW SUBJECT"}
            editable={!this.state.disabled && this.state.selectedsubject === "Other"}
          />
          <Button disabled={this.state.disabled} onPress={() => { this.addItem("tutoring", false) }} title="Add Subject" />
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
                      style = {{backgroundColor: '#e20000', flex: 1,  alignItems: 'center'}}
                      disabled={this.state.disabled}
                      onPress={({idex}) => this.removeFromService(item.label, index, "tutoring", false)}><Text style={{
                        color: '#fff',
                        fontFamily: 'Arial',
                        fontWeight: 'bold',
                        fontSize: 18,
                        justifyContent: 'center',
                        paddingRight: 20,
                      }}>DELETE</Text></TouchableHighlight>,
                    ];
                    console.log("Rendering");
                    console.log(item);
                    console.log(index);
                    return (<Swipeable rightButtons={rightButtons} disabled={this.state.disabled}>
                              <this.Subject name={item.label} need={false}/>
                            </Swipeable>);}
                }
            />
          </ScrollView>
        </View>,
      },
      {
        title: 'DELIVERY SKILLS',
        content: <View>
        <Text style={styles.biglabelText}>Please describe what you are willing to deliver. </Text>
        <Text style={styles.labelText}>How far are away are you willing to go to deliver something?</Text>
        <RNPickerSelect
          disabled={this.state.disabled}
          placeholder={{
            label: this.state.delivery['timetodeliver'] + 'minutes',
            value: this.state.delivery['timetodeliver'],
            color: '#9EA0A4',
          }}
          items={times}
          onValueChange={value => {
            this.onDeliveryChange('timetodeliver', value)
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
        <Text style={styles.labelText}>How far are away are you willing to go to pick up items that need to be delivered?</Text>
        <RNPickerSelect
          disabled={this.state.disabled}
          placeholder={{
            label: this.state.delivery['timetopickup'] + ' minutes',
            value: this.state.delivery['timetopickup'],
            color: '#9EA0A4',
          }}
          items={times}
          onValueChange={value => {
            this.onDeliveryChange('timetopickup', value)
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
        <Text style={styles.labelText}>Please select and describe your preferences for each item you are willing to deliver below.</Text>
            {this.renderDropdownService("delivery", false)}
        <Input 
          style={styles.input}
          onChangeText={(value) => { this.setState({newDeliveryCategory: value})}}
          value={this.state.newDeliveryCategory}
          label={"NEW CATEGORY"}
          editable={this.state.selectedcategory === "Other" && !this.state.disabled}
        />
        <Button disabled={this.state.disabled} onPress={() => { this.addItem("delivery", false)}} title="Add Category" />
        <ScrollView>
          <FlatList
                data={this.state.deliveryRows}
                style={{
                  flex: 1,
                }}
                renderItem={({ item, index }) => 
                {
                  const rightButtons = [
                    <TouchableHighlight 
                    disabled={this.state.disabled}
                    style = {{backgroundColor: '#e20000', flex: 1,  alignItems: 'center'}}
                    onPress={({idex}) => this.removeFromService(item.label, index, "delivery", false)}><Text style={{
                      color: '#fff',
                      fontFamily: 'Arial',
                      fontWeight: 'bold',
                      fontSize: 18,
                      justifyContent: 'center',
                      paddingRight: 20,
                    }}>DELETE</Text></TouchableHighlight>,
                  ];
                  console.log("Rendering");
                  console.log(item);
                  console.log(index);
                  return (<Swipeable rightButtons={rightButtons} disable={this.state.disabled}>
                            <this.Category name={item.label} need={false}/>
                          </Swipeable>);}
              }
          />
        </ScrollView>
      </View>,
      },
      {
        title: 'TUTORING NEEDS',
        content: <View>
        <Text style={styles.biglabelText}>Please describe your tutoring needs. </Text>
        <Text style={styles.labelText}>How far are away are you willing to go to get tutored?</Text>
        <RNPickerSelect
          placeholder={{
            label: this.state.tutoringNeeds['timetogettutored'] + ' minutes',
            value: this.state.tutoringNeeds['timetogettutored'],
            color: '#9EA0A4',
          }}
          items={times}
          onValueChange={value => {
            this.onTutoringNeedsChange('timetogettutored', value)
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
        <Text style={styles.labelText}>Please select and describe your needs in each subject below.</Text>
            {this.renderDropdownService("tutoring", true)}
        <Input 
          style={styles.input}
          onChangeText={(value) => { this.setState({newTutoringSubjectNeed: value})}}
          value={this.state.newTutoringSubjectNeed}
          label={"NEW SUBJECT"}
          editable={this.state.selectedsubjectneed === "Other"}
        />
        <Button onPress={() => { this.addItem("tutoring", true) }} title="Add Subject" />
        <ScrollView>
          <FlatList
                data={this.state.tutoringRowsNeed}
                style={{
                  flex: 1,
                }}
                renderItem={({ item, index }) => 
                {
                  const rightButtons = [
                    <TouchableHighlight 
                    style = {{backgroundColor: '#e20000', flex: 1,  alignItems: 'center'}}
                    onPress={({idex}) => this.removeFromService(item.label, index, "tutoring", true)}><Text style={{
                      color: '#fff',
                      fontFamily: 'Arial',
                      fontWeight: 'bold',
                      fontSize: 18,
                      justifyContent: 'center',
                      paddingRight: 20,
                    }}>DELETE</Text></TouchableHighlight>,
                  ];
                  console.log("Rendering");
                  console.log(item);
                  console.log(index);
                  return (<Swipeable rightButtons={rightButtons}>
                            <this.Subject name={item.label} need={true}/>
                          </Swipeable>);}
              }
          />
        </ScrollView>
      </View>,
      },
      {
        title: 'DELIVERY NEEDS',
        content: <View>
        <Text style={styles.biglabelText}>Please describe what you need delivered. </Text>
        <Text style={styles.labelText}>How far are away are you willing to go to pick up items you need delivered?</Text>
        <RNPickerSelect
          placeholder={{
            label: this.state.deliveryNeeds['timetopickup'] + ' minutes',
            value: this.state.deliveryNeeds['timetopickup'],
            color: '#9EA0A4',
          }}
          items={times}
          onValueChange={value => {
            this.onDeliveryNeedsChange('timetopickup', value)
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
        <Text style={styles.labelText}>Please select and describe your preferences for each item you need below.</Text>
            {this.renderDropdownService("delivery", true)}
        <Input 
          style={styles.input}
          onChangeText={(value) => { this.setState({newDeliveryCategoryNeed: value})}}
          value={this.state.newDeliveryCategoryNeed}
          label={"NEW CATEGORY"}
          editable={this.state.selectedcategoryneed === "Other"}
        />
        <Button onPress={() => { this.addItem("delivery", true)}} title="Add Category" />
        <ScrollView>
          <FlatList
                data={this.state.deliveryRowsNeed}
                style={{
                  flex: 1,
                }}
                renderItem={({ item, index }) => 
                {
                  const rightButtons = [
                    <TouchableHighlight 
                    style = {{backgroundColor: '#e20000', flex: 1,  alignItems: 'center'}}
                    onPress={({idex}) => this.removeFromService(item.label, index, "delivery", true)}><Text style={{
                      color: '#fff',
                      fontFamily: 'Arial',
                      fontWeight: 'bold',
                      fontSize: 18,
                      justifyContent: 'center',
                      paddingRight: 20,
                    }}>DELETE</Text></TouchableHighlight>,
                  ];
                  console.log("Rendering");
                  console.log(item);
                  console.log(index);
                  return (<Swipeable rightButtons={rightButtons}>
                            <this.Category name={item.label} need={true}/>
                          </Swipeable>);}
              }
          />
        </ScrollView>
      </View>,
      }
    ];
  }

  /**
     * Handles account form submission.
     *
     * @private
     */
    onAccountSubmit() {
      console.log(this.state);
      const {password, id, nameFirst, nameLast, phone, bio, tutoring, delivery, tutoringNeeds, deliveryNeeds} = this.state;
      this.signup(id, password, {id, nameFirst, nameLast, bio, phone, tutoring, delivery, deliveryNeeds, tutoringNeeds});
      this.props.navigation.navigate('Login');
  }

  async signup(username, password, profile) {
    console.log('signup');
    try {
        console.log("Attempting signup");
        await User.signup(username, password, profile);
        return null;
    } catch (err) {
        return err;
    }
}


  render() {
  
  
    return (
      <ScrollView styles={styles.welcomeContainer}>
        <View style={styles.input}>
          <Text styles={styles.biglabelText} h2>{this.state.profile.nameFirst + ' ' + this.state.profile.nameLast}</Text>
        </View>
        <View style={styles.input}>
          <Accordion
            sections={this.SECTIONS()}
            activeSections={this.state.activeSections}
            renderSectionTitle={this._renderSectionTitle}
            renderHeader={this._renderHeader}
            renderContent={this._renderContent}
            onChange={this._updateSections}
          />
          <Input
              style={styles.input}
              onChangeText={(value) => { this.setState({bio: value})}}
              value={this.state.bio}
              multiline={true}
              editable={this.state.disabled}
              label={"ANYTHING ELSE YOU'D LIKE TO ADD?"}
          />
        </View>  
        <Button onPress={this.onEditClick} title={this.state.disabled ? 'Edit Profile' : 'Save Changes' } />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  subject: {
    borderColor: '#708090',
    borderWidth: 2,
  },
  biglabelText:{
    fontVariant: ['small-caps'],
    color: '#708090',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Arial',
    padding: 10,
  },
  labelText: {
    color: '#708090',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Arial',
    padding: 5,
  },
  input: {
    padding: 15,
  },
  headerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Arial'
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