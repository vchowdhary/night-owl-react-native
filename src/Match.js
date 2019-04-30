import React from 'react';
import StarRating from 'react-native-star-rating';
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
import Modal from 'react-native-modalbox';

import config from '../config';

const url = config.url;
const API = '/api/history/';

export default class Match extends React.Component{
    constructor(props)
    {
        super(props);

        this.state={
            rating: 1
        };

        ['rateRequest',
        'onStarRatingPress',
        'submitRating']
    .forEach(key => {
        this[key] = this[key].bind(this);
    });
    }

    rateRequest(matchID)
    {
      this.refs.modal3.open();
      console.log(matchID);
    }

    

    onStarRatingPress(rating) {
        this.setState({
          rating: rating
        });
    }


    async submitRating()
    {
        await fetch(url+API, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                matchID: this.props.data.id,
                rating: this.state.rating,
                type: this.props.type
            }),
        })
        .then((res) => {
            console.log(res.status);
            this.refs.modal3.close();
        });
    }

    render()
    {
        console.log('Rendering');
      console.log(this.props.data);
      return (<View style={styles.matchContainer}>
                    <Text style={styles.biglabelText}>{this.props.type === 'request' ? 'REQUEST' : 'OFFER'}</Text>
                    {this.props.type !== 'request' ? 
                    <View>
                        <Text style={styles.labelText}> Requester: </Text>
                        <Text> {this.props.data.requester_id} </Text> 
                    </View> 
                    : 
                    <View>
                        <Text style={styles.labelText}> Provider: </Text>
                        <Text> {this.props.data.provider_id} </Text> 
                    </View>}
                    <Text style={styles.labelText}>Service: </Text>
                    <Text> {this.props.data.service_type} </Text>
                    <Text style={styles.labelText}> Details: </Text>
                    <Text> {this.props.data.details} </Text> 
                    {(this.props.data.subject_1 !== "") ? 
                        <View>
                        <Text style={styles.labelText}> Subject 1: </Text>
                        <Text> { this.props.data.subject_1} </Text>
                        </View>
                    :   null}
                    {(this.props.data.subject_2 !== "") ? 
                        <View>
                            <Text style={styles.labelText}> Subject 2: </Text>
                            <Text> { this.props.data.subject_2} </Text>
                        </View>
                    :   null}
                    {(this.props.data.subject_3 !== "") ? 
                        <View>
                            <Text style={styles.labelText}> Subject 3: </Text>
                            <Text> { this.props.data.subject_3} </Text>
                        </View>
                    :   null}
                    <Text style={styles.labelText}> Location: </Text>
                    <Text> {this.props.data.location.lat + ', ' + this.props.data.location.lng} </Text>
                    <Button onPress={() => { this.rateRequest(this.props.data.id)}} title={"Rate This Match"} />
                    <Modal style={styles.modal3} position={"center"} ref={"modal3"}>
                        <Text style={styles.labelText}> Rate your match </Text>
                        <StarRating
                            disabled={false}
                            maxStars={5}
                            rating={this.state.rating}
                            selectedStar={(rating) => this.onStarRatingPress(rating)}
                        />
                        <Button onPress={() => this.submitRating()} title={"Submit"} />
                        <Button onPress={() => this.refs.modal3.close()} title={"Cancel"}/>
                    </Modal>
              
              </View>
              
              );
    }
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
    modal3: {
        height: 300,
        width: 300,
        alignItems: 'center',
    },
    
    btn: {
        flex: 1,
        padding: 10
    },
  });