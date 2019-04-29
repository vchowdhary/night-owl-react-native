import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  AsyncStorage,
  FlatList
} from 'react-native';
import { WebBrowser } from 'expo';
import {Button, Label, Input, Text, Slider} from 'react-native-elements';

import { MonoText } from '../components/StyledText';
import config from '../config';
import Match from '../src/Match';

const url = config.url;
const API = '/api/history';

export default class InboxScreen extends React.Component {
  constructor(props){
    super(props);

    this.state = {
        matches: [],
    };

    ['getPendingMatches', 
     'Match',
    'rateRequest',
    'rateOffer']
    .forEach(key => {
        this[key] = this[key].bind(this);
    });


  }

  
  async componentDidMount(){
    console.log('Params');
    const id = await AsyncStorage.getItem("userToken");
    console.log(id);
    this._id = id;
    console.log('id');
    console.log(this._id); 
    this.getPendingMatches();
  }

  async getPendingMatches(){
      await fetch(url + API + '?type=getPending&id='+this._id,{
          method: 'GET',
          headers: {
            Accept: 'application/json',
          }
        })
        .then((res) => 
        {
            //console.log(JSON.parse(res._bodyText));
            this.state.matches = JSON.parse(res._bodyText);
            this.setState({matches: this.state.matches});
        })
  }

  rateRequest(matchID)
  {
      console.log(matchID);
  }

  rateOffer(matchID)
  {
      console.log(matchID);
  }

  renderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: "86%",
          backgroundColor: "#CED0CE",
          marginLeft: "14%"
        }}
      />
    );
  };

  Match(props)
  {
      console.log('Rendering');
      console.log(props.data);
      return (<View style={styles.matchContainer}>
                    <Text style={styles.biglabelText}>{props.type === 'request' ? 'REQUEST' : 'OFFER'}</Text>
                    {props.type !== 'request' ? 
                    <View>
                        <Text style={styles.labelText}> Requester: </Text>
                        <Text> {props.data.requester_id} </Text> 
                    </View> 
                    : 
                    <View>
                        <Text style={styles.labelText}> Provider: </Text>
                        <Text> {props.data.provider_id} </Text> 
                    </View>}
                    <Text style={styles.labelText}>Service: </Text>
                    <Text> {props.data.service_type} </Text>
                    <Text style={styles.labelText}> Details: </Text>
                    <Text> {props.data.details} </Text> 
                    {(props.data.subject_1 !== "") ? 
                        <View>
                        <Text style={styles.labelText}> Subject 1: </Text>
                        <Text> { props.data.subject_1} </Text>
                        </View>
                    :   null}
                    {(props.data.subject_2 !== "") ? 
                        <View>
                            <Text style={styles.labelText}> Subject 2: </Text>
                            <Text> { props.data.subject_2} </Text>
                        </View>
                    :   null}
                    {(props.data.subject_3 !== "") ? 
                        <View>
                            <Text style={styles.labelText}> Subject 3: </Text>
                            <Text> { props.data.subject_3} </Text>
                        </View>
                    :   null}
                    <Text style={styles.labelText}> Location: </Text>
                    <Text> {props.data.location.lat + ', ' + props.data.location.lng} </Text>
                    <Button onPress={() => { props.type === 'request' ? this.rateRequest(props.data.id) : this.rateOffer(props.data.id)}} title={"Rate This Match"} />
              </View>);
  }

  render() {
    console.log(this.state.matches === []);
    return (
      <View style={styles.container}>
        <Text style={styles.biglabelText}>YOUR PENDING MATCHES</Text>
         <FlatList
            ItemSeparatorComponent={this.renderSeparator}
            style={styles.container}
            data={this.state.matches}
            renderItem={({item}) => { 
               console.log("Rendering item");
               //console.log(item);
               return (<Match data={item.match} type={item.type}/>);
            }}
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
    alignContent: 'center'
  },
  matchContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  biglabelText:{
    color: '#708090',
    fontSize: 18,
    fontWeight: 'bold',
    padding: 10,
  },
  labelText: {
    color: '#708090',
    fontSize: 14,
    fontWeight: 'bold',
    padding: 5,
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
