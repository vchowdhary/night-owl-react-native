/**
 * Logout button.
 *
 * @module src/Logout
 */

import React from 'react';
import { shape, func, object, string } from 'prop-types';
import { withRouter } from 'react-router-dom';
import Octicon, { SignOut } from '@githubprimer/octicons-react';

import User from 'src/User';

/**
 * Logout button.
 *
 * @alias module:src/routes/logout
 *
 * @param {Object} props - The component's props.
 * @returns {ReactElement} The component's elements.
 */
function Logout(props) {
    const { history, location, className } = props;

    return <button
        className={className}
        disabled={!User.loggedIn}
        onClick={async function() {
            await User.logout();
            history.replace(location);
        }}
    >
        <Octicon icon={SignOut} />
        &nbsp;Log out
    </button>;
}

Logout.propTypes = {
    history: shape({
        replace: func.isRequired
    }).isRequired,
    location: object.isRequired,
    className: string
};

export default withRouter(Logout);

