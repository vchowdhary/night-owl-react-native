const firebase = require('firebase');

export const initializeFirebase = () => {
    firebase.initializeApp({
        messagingSenderId: '578033269276'
    });
};

// eslint-disable-next-line id-length
export const askForPermissionToReceiveNotifications = async() => {
    try {
        const messaging = firebase.messaging();
        await messaging.requestPermission();
        const token = await messaging.getToken();
        console.log('token:', token);



        messaging.onMessage(payload => {
            console.log('Notification Received', payload);
            //this is the function that gets triggered when you receive a 
            //push notification while you’re on the page. So you can 
            //create a corresponding UI for you to have the push 
            //notification handled.
        });
    
        return token;
    } catch (error) {
        console.error(error);
    }
};

// If you would like to customize notifications that are received in the background (Web app is closed or not in browser focus) then you should implement this optional metho