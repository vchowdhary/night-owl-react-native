/* eslint-disable object-curly-spacing */
/**
 * Signup page.
 *
 * @module src/routes/signup
 */

import React from 'react';
import { shape, string, func } from 'prop-types';
import { hot } from 'react-hot-loader';
import { Redirect } from 'react-router-dom';

import User from 'src/User';

import Basic from './Basic';
import Profile from './Profile';
import Account from './Account';

import styles from './index.less';



/**
 * Signup page.
 *
 * @alias module:src/routes/signup
 */
class Signup extends React.Component {
    /**
     * Initializes the component.
     *
     * @param {Object} props - The component's props.
     */
    constructor(props) {
        super(props);

        const { loggedIn } = User;

        const loading = loggedIn === null;
        const redirect = loggedIn === true;

        const {
            username,
            password
        } = this.locationState;

        this.state = {
            loading,
            redirect,
            message: null,
            username,
            password,
            tutoring: {},
            delivery: {},
            tutoringNeeds: {},
            deliveryNeeds: {}
        };

        [
            'onAccountSubmit',
            'onChange'
        ].forEach(key => {
            this[key] = this[key].bind(this);
        });

        if (loading) {
            (async() => {
                await User.refreshLoginStatus();
                this.setState({
                    loading: false,
                    redirect: User.loggedIn
                });
            })();
        }
    }

    /**
     * The current location state.
     *
     * @private
     * @readonly
     * @type {Object}
     */
    get locationState() {
        const { location } = this.props;

        return location.state || {
            referer: { pathname: location.pathname }
        };
    }

    /**
     * Handles account form submission.
     *
     * @private
     */
    onAccountSubmit() {
        const { username, password, ...profile } = this.state;
        delete profile.loading;
        delete profile.redirect;
        delete profile.message;

        this.setState({ loading: true });
        this.signup(username, password, profile);
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
        //console.log(this.state);
    }

    /**
     * Renders the component.
     *
     * @returns {ReactElement} The component's elements.
     */
    render() {
        if (this.state.redirect) {
            const { referer } = this.locationState;
            return <Redirect to={referer} />;
        }

        const {
            onAccountSubmit,
            onChange
        } = this;

        const {
            loading,
            message,
            ...data
        } = this.state;

        delete data.redirect;

        return <div className={styles.signup}>
            <Basic
                disabled={loading}
                onChange={onChange}
                {...data}
            />
            <Profile 
                disabled={loading}
                onChange={onChange}
                {...data}
            />
            <Account
                disabled={loading}
                onSubmit={onAccountSubmit}
                onChange={onChange}
                message={message}
                {...data}
            />
        </div>;
    }

    /**
     * Attempts to sign up with the given account information.
     *
     * @private
     * @param {string} username - The username.
     * @param {string} password - The password.
     * @param {Object} profile - Profile information.
     * @returns {Promise} Resolves with `null` on success, or with an `Error` if
     * an error was handled.
     */
    async signup(username, password, profile) {
        try {
            await User.signup(username, password, profile);

            this.setState({ loading: false, redirect: true, message: null });

            return null;
        } catch (err) {
            const message = <p className={styles.error}>
                Signup failed: {err.message}
            </p>;

            this.setState({ loading: false, message });

            return err;
        }
    }
}

Signup.propTypes = {
    className: string,
    onClick: func,
    location: shape({
        state: shape({
            referer: shape({
                pathname: string.isRequired
            }).isRequired
        }),
        pathname: string.isRequired
    }).isRequired
};

export default hot(module)(Signup);

