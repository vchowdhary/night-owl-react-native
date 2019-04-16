/**
 * User profile.
 *
 * @module src/routes/profile
 */

import React from 'react';
import { shape, string } from 'prop-types';
import { hot } from 'react-hot-loader';
import { Switch, Route, Redirect } from 'react-router-dom';

import User from 'src/User';
import Profile from 'src/User/Profile';
import Delete from 'src/User/Delete';

import styles from './index.less';

/**
 * User profile page.
 *
 * @param {Object} props - The component's props.
 * @returns {ReactElement} The component's elements.
 */
function ProfilePage(props) {
    return <div className={styles.profile}>
        <Profile {...props} />
        <div className={styles.danger}>
            <Delete className={styles.delete} />
        </div>
    </div>;
}

/**
 * User profile routes.
 *
 * @param {Object} props - The component's props.
 * @param {Object} props.match - The router match.
 * @param {string} props.match.url - The matched URL.
 * @returns {ReactElement} The component's elements.
 */
function ProfileRoutes(props) {
    const { url } = props.match;

    return <Switch>
        <Redirect
            from={`${url}:id`}
            exact={true}
            strict={true}
            to={`${url}:id/`}
        />
        <Route
            path={`${url}:id/`}
            strict={true}
            render={function({ match }) {
                const id = decodeURIComponent(match.params.id);
                return <ProfilePage id={id} />;
            }}
        />
        {
            User.loggedIn
                ? <Redirect to={`${url}${encodeURIComponent(User.id)}/`} />
                : <Redirect to="/login" />
        }
    </Switch>;
}

ProfileRoutes.propTypes = {
    match: shape({
        url: string.isRequired
    }).isRequired
};

export default hot(module)(ProfileRoutes);

