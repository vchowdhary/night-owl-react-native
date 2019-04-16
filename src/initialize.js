/* eslint-disable require-jsdoc */
import firebase from 'firebase';
// eslint-disable-next-line require-jsdoc


var admin = require('firebase-admin');

var serviceAccount = require('./serviceAccountKey.json');

export function initializePush() {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: 'https://night-owl-bakery-1551212306895.firebaseio.com'
    });

    const messaging = firebase.messaging();
    messaging
        .requestPermission()
        .then(() => {
            console.log('Have Permission');
            return messaging.getToken();
        })
        .then(token => {
            console.log('FCM Token:', token);
            //you probably want to send your new found FCM token to the
            //application server so that they can send any push
            //notification to you.
        })
        .catch(error => {
            if (error.code === 'messaging/permission-blocked') {
                console.log('Please Unblock Notification Request Manually');
            } else {
                console.log('Error Occurred', error);
            }
        });
    
    messaging.onMessage(payload => {
        console.log('Notification Received', payload);
        //this is the function that gets triggered when you receive a 
        //push notification while you’re on the page. So you can 
        //create a corresponding UI for you to have the push 
        //notification handled.
    });
}
