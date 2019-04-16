/*import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>Open up App.js to start working on your app!</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});*/

/**
 * App entry point.
 *
 * @module src/index
 */


import React from 'react';
import { render } from 'react-dom';

import User from 'src/User';
import App from 'src/App';
import { initializeFirebase } from './push-notification';
import { askForPermissionToReceiveNotifications } from './push-notification';

const appDiv = document.createElement('div');
appDiv.id = 'app';
document.body.appendChild(appDiv);

/**
 * Renders the app onto the page.
 *
 * @private
 */
function renderApp() {
    initializeFirebase();
    console.log('User token:');
    var token = askForPermissionToReceiveNotifications();
    token.then(function(result){
        console.log(result);
        User.token(result);
    });
    render(<App />, appDiv);
    
}

/**
 * Starts the app.
 *
 * @private
 */
async function start() {
    await User.refreshLoginStatus();
    renderApp();
}

start();

if (module.hot) {
    module.hot.accept('src/User', start);
    module.hot.accept('src/App', renderApp);

    module.hot.dispose(() => {
        document.body.removeChild(appDiv);
    });
}


