

import React from 'react';
//import GoogleMapReact from 'google-map-react';
import User from '../User';
//import Geolocation from 'src/Location';
import { string } from 'prop-types';
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from 'react-google-maps';

var watchId = 0;

const MapComponent = withScriptjs(withGoogleMap(props => {
    return (
        <GoogleMap
            defaultZoom={ 20 }
            defaultCenter={{ lat: 21.1744336, lng: 72.7954677 }}
            center = { props.myLatLng }
        >
            <Marker
                position = { props.myLatLng }
            />
        </GoogleMap>
    );
}));

/**
 * Creates Map
 */
export default class Map extends React.Component {
    /**
     * Creates instance of Map
     * @param {props} props - component's props
     */
    constructor(props)
    {
        super(props);
        const { id } = User;
        console.log('map id');
        console.log(id);
        this.state = {
            id,
            currentLatLng: {
                lat: 0,
                lng: 0
            }
        };
    }
    
    /**
     * Gets and sets current position
     */
    showPosition() {
        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                position => {
                    this.setState(({
                        currentLatLng: {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        }
                    }));
                }
            );
        } else {
            error => console.log(error);
        }
    }

    /**
     * React lifecycle handler called when component has been mounted.
     */
    async componentWillMount(){
        this.showPosition();
    }

    /**
     * Show position when component mounted
     */
    async componentDidMount(){
        this.showPosition();
    }

    /**
     * Clear the watch when leaving this page
     */
    async componentWillUnmount(){
        navigator.geolocation.clearWatch(watchId);
    }


    /**
     * Renders React component
     * @param {string} latitude - location lat
     * @param {string} longitude - location lng
     * @returns {GoogleMapReact} map - the map 
     */
    render() {
        return (
            <MapComponent myLatLng = {this.state.currentLatLng}
                googleMapURL = "AIzaSyB4Moe_Z6IW0Ixjz4iMqbTpm_sKmNmnZjs"
                loadingElement = { <div style={{ height: '100%' }} /> }
                containerElement = { <div style={{ height: '100vh', width: '100vh' }} /> }
                mapElement = { <div style={{ height: '100%' }} /> }
            />
        );
    }
}

Map.propTypes = {
    className: string
};
