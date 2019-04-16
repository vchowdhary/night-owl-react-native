/**
 * App root component.
 *
 * @module src/App
 */

import React from 'react';
import { func, boolean } from 'prop-types';
import { hot } from 'react-hot-loader';
import { BrowserRouter,Switch, Route, Redirect } from 'react-router-dom';

import asyncComponent from 'src/async-component';
import Spinner from 'src/Spinner';
import User from 'src/User';
import { routeConfigFlat } from 'src/routeConfig';

import AsyncNotFound from 'bundle-loader?lazy!./NotFound';
import Header from './Header';

import styles from './index.less';

const NotFound = asyncComponent(AsyncNotFound, Spinner);

/**
 * Represents a route that needs authentication.
 *
 * @private
 * @param {Object} props - The properties for the route.
 * @returns {ReactElement} The component's elements.
 */
function AuthRoute(props) {
    const { auth, component: Component, ...rest } = props;

    return <Route {...rest} render={componentProps => {
        if (auth && !User.loggedIn) {
            const redirect = {
                pathname: User.paths.login,
                state: { referer: componentProps.location }
            };
            return <Redirect to={redirect} />;
        }

        return <Component {...componentProps} />;
    }} />;
}

AuthRoute.propTypes = {
    auth: boolean,
    component: func.isRequired
};

const routes = routeConfigFlat.map(config => {
    const { path, component } = config;

    const props = {
        key: path,
        component,
        path,
        exact: path === '/',
        strict: true
    };

    return ('auth' in config)
        ? <AuthRoute auth={config.auth} {...props} />
        : <Route {...props} />;
});

/**
 * Redirects paths without a trailing slash to paths with a slash.
 *
 * @param {string} path - The path, including the trailing slash.
 * @returns {ReactElement} The redirect.
 */
function redirectNoSlash(path) {
    if (!path.endsWith('/')) {
        throw new Error('Path does not end with a slash.');
    }

    const noSlash = path.substr(0, path.length - 1);
    if (!noSlash) {
        return;
    }

    return <Redirect
        key={noSlash}
        from={noSlash}
        exact
        strict
        to={path}
    />;
}

// Create redirects for missing trailing slashes.
const routeRedirects = routeConfigFlat.map(config => {
    return redirectNoSlash(config.path);
});

/**
 * App root component.
 *
 * @alias module:src/App
 *
 * @returns {ReactElement} The component's elements.
 */
function App() {
    return <BrowserRouter basename={__webpack_public_path__}>
        <div className={styles.app}>
            <Header />
            <main>
                <Switch>
                    {routeRedirects}
                    {routes}
                    <Route component={NotFound} />
                </Switch>
            </main>
        </div>
    </BrowserRouter>;
}

export default hot(module)(App);

