import { Permissions, Notifications } from 'expo';
import { Alert, View, Text, AsyncStorage } from 'react-native';
import React from 'react';

import config from '../config';

const url = config.url;
const API = '/api/tokens/';
const API2 = '/api/notifications'

export default class PushNotification {
    constructor(){
        this.registerForPushNotificationsAsync();
    }

    async registerForPushNotificationsAsync() {
        const id = await AsyncStorage.getItem("userToken");
        console.log(id);

        if(true)
        {
            console.log('Registering');
            const { status: existingStatus } = await Permissions.getAsync(
            Permissions.NOTIFICATIONS
            );
            let finalStatus = existingStatus;

            console.log(finalStatus);
            console.log(existingStatus);
        
            // only ask if permissions have not already been determined, because
            // iOS won't necessarily prompt the user a second time.
            if (existingStatus !== 'granted') {
            // Android remote notification permissions are granted during the app
            // install, so this will only ask on iOS
            const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
            finalStatus = status;
            }
        
            // Stop here if the user did not grant permissions
            if (finalStatus !== 'granted') {
            return;
            }

            console.log('Getting token');
        
            // Get the token that uniquely identifies this device
            const token = await Notifications.getExpoPushTokenAsync()
            .then((token) => {
            console.log("token");
            console.log(token);
            Alert.alert(token);
            return token;
            });
            
            // POST the token to your backend server from where you can retrieve it to send push notifications.
            await fetch(url + API, {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: token,
                id: id,
            }),
            })
            .then((res) =>
            {
                console.log(res.status);
            });
        }
    }

    handleMatchNotification(notification){
        console.log(notification);

    }

    handleNotification(notification){
        console.log(notification);
        if (notification.data.type === 'match')
        {
            this.handleMatchNotification(notification);
        }
    }

    async setStatus(id, status){
        await fetch(url + API2, {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: id,
                status: status,
                update: true
            }),
        })
        .then((res) =>
        {
            console.log(res.status);
        });
    }
}