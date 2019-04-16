/**
 * Logout page.
 *
 * @module src/routes/logout
 */

import React from 'react';
import { shape, string } from 'prop-types';
import { Redirect } from 'react-router-dom';

import User from 'src/User';

/**
 * Logout page.
 *
 * @alias module:src/routes/logout
 */
class Logout extends React.Component {
    /**
     * Initializes the component.
     */
    constructor() {
        super();

        this.state = { redirect: false };
    }

    /**
     * React lifecycle handler called when the component is about to be
     * mounted.
     */
    async componentWillMount() {
        await User.logout();
        this.setState({ redirect: true });
    }

    /**
     * Renders the component.
     *
     * @returns {ReactElement} The component's elements.
     */
    render() {
        const { location } = this.props;

        const locationState = location.state || {
            referer: { pathname: '/' }
        };

        const { redirect } = this.state;
        if (redirect) {
            return <Redirect to={locationState.referer} />;
        }

        return <p>Logging out...</p>;
    }
}

Logout.propTypes = {
    location: shape({
        state: shape({
            referer: shape({
                pathname: string.isRequired
            }).isRequired
        })
    }).isRequired
};

export default Logout;

