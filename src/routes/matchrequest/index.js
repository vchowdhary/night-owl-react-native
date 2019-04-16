/* eslint-disable max-len */
/* eslint-disable no-else-return */
/* eslint-disable no-lonely-if */
/* eslint-disable require-jsdoc */
/* eslint-disable react/jsx-key */
/* eslint-disable react/no-direct-mutation-state */
/**
 * Homepage.
 *
 * @module src/route
 */

import React from 'react';
import { hot } from 'react-hot-loader';
//import Octicon, { Plus } from '@githubprimer/octicons-react';
import User from 'src/User';
import XHRpromise from 'src/XHRpromise';
import styles from './index.less';
import LabeledInput from 'src/LabeledInput';
import { withScriptjs, withGoogleMap, Marker, GoogleMap } from 'react-google-maps';


const API3 = '/api/subjects';
const API2 = '/api/history/';
const API = '/api/match/';

const TEXT_MAXLEN = 255;

//import ButtonLink from 'src/ButtonLink';
//import Counter from 'src/Counter';

//import styles from './index.less';

var watchId = 0;

const MapComponent = withScriptjs(withGoogleMap(props => {
    console.log(props.markers);
    const markers = props.markers.map((marker, index) => 
        <Marker
            key = { marker.id }
            position = { { lat: marker.lat, lng: marker.lng } }
            draggable = {true}
            onDragEnd = {function(e){
                props.onPositionChanged(e,index);
            }
            }
            icon = { {
                url: marker.color === 'blue' ? 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
            } }
        />);

    console.log(markers);

    return (
        <GoogleMap
            defaultZoom={ 20 }
            defaultCenter={{ lat: 21.1744336, lng: 72.7954677 }}
            center = { props.myLatLng }
        >
            {markers}
        </GoogleMap>
    );
}));

/**
 * Homepage.
 *
 * @returns {ReactElement} The component's elements.
 */
class MatchPage extends React.Component {
    /**
     * Initializes the component.
     *
     * @param {Object} props - The component's props.
     */
    constructor(props)
    {
        super(props);
        const { id } = User;

        const { loggedIn } = User;

        const loading = loggedIn === null;
        const redirect = loggedIn === true; 

        this.state = {
            profile: {},
            loading,
            redirect,
            request: { 
                type: 'tutoring', 
                subject_1: '',
                subject_2: '',
                subject_3: '',
                details: '', 
                timetodeliver: 0,
                dropofflocation: {},
                location: {}
            },
            newsubject: '',
            tutoringSubjects: {},
            deliveryCategories: {},
            currentLatLng: {
                lat: 0,
                lng: 0
            },
            markers: [{ id: 'currpos', lat: -1, lng: -1, color: 'blue' }]
        };
        this.id = id;

        [
            'Request',
            'requestChange',
            'handleChange',
            'matchRequest',
            'addMatchToRecords',
            'renderDropdown',
            'Dropdown',
            'Other',
            'addSubject',
            'addDeliveryCategory',
            'pushToDatabase',
            'onChange',
            'showPosition',
            'onMarkerPositionChanged',
            'addMarker',
            'calculateDistance',
            'deg2rad'
        ].forEach(key => {
            this[key] = this[key].bind(this);
        });

        if (loading) {
            (async() => {
                await User.refreshLoginStatus();
                const profile = await User.getProfile();
                this.setState({
                    loading: false,
                    redirect: User.loggedIn,
                    profile: profile
                });
            })();
        }
    }

    /**
     * Runs before component mounts
     */
    async componentWillMount(){
        this.renderDropdown('tutoringSubjects');
        this.renderDropdown('deliveryCategories');
        this.showPosition();
    }

    /**
     * Clear the watch when leaving this page
     */
    async componentWillUnmount(){
        navigator.geolocation.clearWatch(watchId);
    }

    /**
     * Gets and sets current position
     */
    async showPosition() {
        this.onChange('currentLatLng', this.state.currentLatLng);
        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                position => {
                    this.setState(({
                        currentLatLng: {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        }
                    }));
                    if(this.state.markers[0].lat === -1){
                        this.state.markers[0].lat = this.state.currentLatLng.lat;
                        this.state.markers[0].lng = this.state.currentLatLng.lng;
                        this.onChange('markers', this.state.markers);
                    }
                }
            );
        } else {
            error => console.log(error);
        }
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
        console.log(this.state);
    }

    /**
     * Add subject
     * @param{event} event - event
     */
    addSubject(event){
        event.preventDefault();
        console.log('Adding subject');
        if((this.state.request.subject === 'other' || this.state.request.subject === '') && this.state.newsubject !== '')
        {
            console.log('Pushing to tutoring - request');
            this.pushToDatabase(this.state.newsubject, 'tutoring');
            this.state.tutoringSubjects.push({ subject: this.state.newsubject });
            this.state.newsubject = '';
        }
        console.log(this.state);
        
    }

    /**
     * Add subject
     * @param{event} event - event
     */
    addDeliveryCategory(event){
        event.preventDefault();
        if((this.state.request.subject === 'other' || this.state.request.subject === '') && this.state.newsubject !== '')
        {  
            console.log('Pushing to delivery - request');
            this.pushToDatabase(this.state.newsubject, 'delivery');
            this.state.deliveryCategories.push({ subject: this.state.newsubject });
            this.state.newsubject = '';
        }
        console.log(this.state);
        
    }

    /**
     * Pushes new subject to the subject database
     * @param {name} name - name of new subject
     * @param {string} servicetype - key of service
     */
    async pushToDatabase(name, servicetype){
        console.log('Pushing subjects');
        console.log(name);
        console.log(servicetype);
        const { status } = await XHRpromise('PUT', API3, {
            contentType: 'application/json',
            body: JSON.stringify({ name, servicetype })
        });
    
        switch (status) {
            case 200:
            case 201:
            case 204:
                break;
            case 401:
                throw new Error('Incorrect.');
            default:
                throw new Error('Unknown error occurred.');
        }

        console.log('Finished PUSH request');
    }
    
    /**
    * Fetches options from database
    * @param {string} key - key for service
    */
    async renderDropdown(key) {
        console.log('Getting subjects');
        const { status, responseText } = await XHRpromise('GET', API3 + '?service=' + key);
    
        switch (status) {
            case 200:
            case 201:
            case 204:
                break;
            case 401:
                throw new Error('Incorrect.');
            default:
                throw new Error('Unknown error occurred.');
        }

        console.log('Finished GET request');
        console.log('tutoring subjects:');

        this.setState({ [key]: JSON.parse(responseText) });
        
        console.log(JSON.parse(responseText));

    }


    /**
     * Handles change in request
     * @param {key} key - key of request
     * @param {*} value - new value
     */
    requestChange(key, value) {
        console.log(key);
        if(key === 'type'){
            if(value === 'delivery'){
                console.log('delivery');
                this.addMarker();
                this.state.request.timetodeliver = 0;
            }
            else{
                if(this.state.markers.length === 2){
                    this.state.markers.pop();
                }
            }
        }
        var requestobj = this.state.request;
        var obj = { request: requestobj };
        requestobj[key] = value;

        this.setState(obj);
        console.log(this.state);
    }

    /**
    * Creates a change handler for the given key.
    *
    * @private
    * @param {Function} onChange - The handler to call.
    * @param {string} key - The key.
    * @returns {Function} The wrapped change handler.
    */
    handleChange(onChange, key) {
        return function(event) {
            onChange(key, event.target.value);
        };
    }
    
    /**
     * Match request submit
     * @param {event} event - event
     */
    async matchRequest(event) {
        //console.log(this.state.request);
        event.preventDefault();
        if (this.state.markers.length === 2){
            this.state.request.timetodeliver = await this.calculateDistance(this.state.markers[0].lat, this.state.markers[0].lng, this.state.markers[1].lat, this.state.markers[1].lng);
            this.state.request.dropofflocation = { lat: this.state.markers[1].lat, lng: this.state.markers[1].lng };
        }
        else{
            this.state.request.timetodeliver = 0;
            this.state.request.dropofflocation = {};

        }

        this.state.request.location = { lat: this.state.markers[0].lat, lng: this.state.markers[0].lng };

        const matchID = this.addMatchToRecords(this.state.request, true);
        console.log(matchID);

        const { status, responseText } = await XHRpromise('GET', API + '?limit=' + 5 + '&request=' + JSON.stringify(this.state.request) + '&matchID=' + matchID);

        switch (status) {
            case 200:
            case 201:
            case 204:
                break;
            case 401:
                throw new Error('Incorrect.');
            default:
                throw new Error('Unknown error occurred.');
        }
        console.log('Received matches:');
        console.log(responseText);
        console.log(responseText === '');
        var responseJSON = responseText === '' ? null : JSON.parse(responseText);
        console.log('response text');
        console.log(responseJSON);
        
        
        
    }

    calculateDistance(lat1, lon1, lat2, lon2){
        var R = 6371; // Radius of the earth in km
        var dLat = this.deg2rad(lat2 - lat1);  // deg2rad below
        var dLon = this.deg2rad(lon2 - lon1); 
        var a = 
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
          Math.sin(dLon / 2) * Math.sin(dLon / 2)
          ; 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
        var d = R * c; // Distance in km
        return d * 1000 / (60);
    }
      
    deg2rad(deg) {
        return deg * (Math.PI / 180);
    }


    /**
     * adds to match history
     * @param {JSON} reqobj - request obj
     * @param {boolean} isRequest - true if it is a
     */
    async addMatchToRecords(reqobj, isRequest)
    {
        console.log('Adding match to records');
        if (isRequest)
        {
            const { status, responseText } = await XHRpromise('PUT', API2, {
                contentType: 'application/json',
                body: JSON.stringify({ requester_id: this.id, provider_id: '', service_type: reqobj.type, subject_1: reqobj.subject_1, subject_2: reqobj.subject_2, subject_3: reqobj.subject_3, 
                    details: reqobj.details, time: reqobj.timetodeliver, location: { lat: this.state.markers[0].lat, lng: this.state.markers[0].lng }, provider_score: 0, requester_score: 0, dropOffLocation: reqobj.dropofflocation })
            });

            console.log('added match to records');
            //console.log(status);
    
            switch (status) {
                case 200:
                case 201:
                case 204:
                    break;
                case 401:
                    throw new Error('Incorrect.');
                default:
                    throw new Error('Unknown error occurred.');
            }
    
            console.log('res');
            console.log(JSON.parse(responseText));
            return responseText;
        }
        else{
            const { status, responseText } = await XHRpromise('PUT', API2, {
                contentType: 'application/json',
                body: JSON.stringify({ requester_id: '', provider_id: this.id, service_type: reqobj.type, subject: reqobj.subject, 
                    details: reqobj.details, time: 0, location: { lat: this.state.markers[0].lat, lng: this.state.markers[0].lng }, score: 0, dropOffLocation: reqobj.dropofflocation })
            });

            console.log('added match to records');
            //console.log(status);
    
            switch (status) {
                case 200:
                case 201:
                case 204:
                    break;
                case 401:
                    throw new Error('Incorrect.');
                default:
                    throw new Error('Unknown error occurred.');
            }
    
            console.log('res');
            console.log(JSON.parse(responseText));
            return responseText;
        }
    }

    /**
     * Handles conditional rendering of tutoring
     * @param {props} props - props
     * @returns {Component} - new component
     */
    Request(props){
        const type = props.type;
        return (
            <div>
                <label> 
                    {type === 'delivery' ? 'What do you need delivered?' : 'What subject do you need help with?'}
                </label>
                <this.Dropdown type={type}/>
                <button onClick={type === 'tutoring' ? this.addSubject : this.addDeliveryCategory}>Add Subject</button>
            </div>
            
        );
    }

    // eslint-disable-next-line require-jsdoc
    Other(){
        return (<div>
            { (this.state.request.subject_1 === 'other' || 
               this.state.request.subject_1 === '' || 
               this.state.request.subject_2 === 'other' || 
               this.state.request.subject_3 === 'other') ? 
                <LabeledInput
                    type="text"
                    label="New subject"
                    value={this.state.newneedsubject}
                    onChange={this.handleChange(this.onChange, 'newneedsubject')}
                >
                </LabeledInput>
                :
                <div></div>
            }
        </div>);
    }


    /**
     * Creates dropdown with subjects. 
     * @param{props} props - true if this is a need
     * @returns {Component} component - x
     */
    Dropdown(props) {
        const { type } = props;
        console.log(this.state);
        var subjects = type === 'tutoring' ? this.state.tutoringSubjects : this.state.deliveryCategories;
        var key = type === 'tutoring' ? 'subject' : 'category';


        console.log('new subjects');
        var newsubjects = new Array(subjects.length);
        for (let i = 0; i < subjects.length; i++)
        {
            newsubjects[i] = subjects[i][[key]];
        }

        console.log(newsubjects);

        console.log('Making dropdown');
        return (
            <div>
                <label>Primary Category</label>
                <select onChange={this.handleChange(this.requestChange, 'subject_1')}>
                    <option value={'other'}> Other </option>
                    {newsubjects.map((x) => {
                        return <option key={x} value={x}> {x} </option>;
                    })}
                </select>
                {type === 'tutoring' ?
                    <div>
                        <label>Secondary Category</label>
                        <select onChange={this.handleChange(this.requestChange, 'subject_2')}>
                            <option value={'other'}> Other </option>
                            <option value={null}>None</option>
                            {newsubjects.map((x) => {
                                return <option key={x} value={x}> {x} </option>;
                            })}
                        </select>
                        <label>Third Category</label>
                        <select onChange={this.handleChange(this.requestChange, 'subject_3')}>
                            <option value={'other'}> Other </option>
                            <option value={null}>None</option>
                            {newsubjects.map((x) => {
                                return <option key={x} value={x}> {x} </option>;
                            })}
                        </select>
                    </div> : null}
                <this.Other type={type}/>
            </div>
        );
    }
    
    /*
    Request:
        Service
            Tutoring
                Category
                Details
                Location → entered in by map (default to current location; this basically specifies where they will go for tutoring)
                How far willing to go to get tutored (in relation to marker on map)
            Delivery
                Category
                Details
                Location -> Entered in by map (default to current location; specifies where they need delivery from and delivery to)
                How far willing to go to pick up items (in relation to marker on map specifying delivery location)

    Offer:
        Service
            Tutoring
                Category
                Details
                Location → entered in by map (where they are willing to hold tutoring)
                How far willing to go to tutor someone
            Delivery
                Category
                Details
                Location → entered in by map (delivery from, delivered at)
                How far willing to go to deliver something from delivered at location
    */

    addMarker(){
        if (this.state.markers.length !== 2){
            this.state.markers.push({ id: 'second', color: 'red', lat: this.state.currentLatLng.lat, lng: this.state.currentLatLng.lng });
        }
        this.onChange('markers', this.state.markers);
    }

    // eslint-disable-next-line require-jsdoc
    onMarkerPositionChanged(coords, index){
        console.log(coords);
        console.log(index);
        this.state.markers[index].lat = coords.latLng.lat();
        this.state.markers[index].lng = coords.latLng.lng();
        this.onChange('markers', this.state.markers);
        console.log(this.state);
    }


    /**
     * Renders the component.
     *
     * @returns {ReactElement} The component's elements.
     */
    render(){
        return <div>
            <div>
                <h1> Make a Request </h1>
                <form className = {styles.match} onSubmit={this.matchRequest} >
                    <section>
                        <label> 
                            What type of request are you making?
                            <select value={this.state.request.type} onChange={this.handleChange(this.requestChange, 'type')}>
                                <option value="tutoring" >Tutoring</option>
                                <option value="delivery">Delivery</option>
                            </select>
                        </label>
                        <this.Request type={this.state.request.type}/>
                        <LabeledInput
                            type="text"
                            label="Details"
                            disabled={this.state.loading}
                            maxLength={TEXT_MAXLEN}
                            required={false}
                            value={this.state.request.details}
                            onChange= {this.handleChange(this.requestChange, 'details')}
                        >
                        </LabeledInput>
                    </section>
                    <h4> {this.state.request.type === 'delivery' ? 'Please select where you are picking up items from (blue marker) and where you will deliver them (red marker)' : 'Please select where you will be tutoring.'} </h4>
                    <input type="submit" value="Submit Request"/>
                </form>
            </div>
            <MapComponent myLatLng = {this.state.currentLatLng}
                googleMapURL = "AIzaSyB4Moe_Z6IW0Ixjz4iMqbTpm_sKmNmnZjs"
                loadingElement = { <div style={{ height: '100%' }} /> }
                containerElement = { <div style={{ height: '90vh', width: '80vh' }} /> }
                mapElement = { <div style={{ height: '100%' }} /> } 
                markers = { this.state.markers }
                onPositionChanged = {this.onMarkerPositionChanged}
            />
        </div>;
    }
}

export default hot(module)(MatchPage);