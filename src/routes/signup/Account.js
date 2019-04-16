/**
 * Account signup form.
 *
 * @module src/routes/signup/Account
 */

import React from 'react';
import { func, string, bool, node } from 'prop-types';
import Octicon, { Plus } from '@githubprimer/octicons-react';
import escapeStringRegexp from 'escape-string-regexp';

import LabeledInput from 'src/LabeledInput';

import logoImage from 'public/images/logo-notext.svg';

/**
 * Maximum username length.
 *
 * @private
 * @readonly
 * @type {number}
 */
const USERNAME_MAXLEN = 255;

/**
 * Maximum password length.
 *
 * @private
 * @readonly
 * @type {number}
 */
const PASSWORD_MAXLEN = 72;

/**
 * Creates a change handler for the given key.
 *
 * @private
 * @param {Function} onChange - The handler to call.
 * @param {string} key - The key.
 * @returns {Function} The wrapped change handler.
 */
function handleChange(onChange, key) {
    return function(event) {
        onChange(key, event.target.value);
    };
}


/**
 * Account signup form.
 *
 * @alias module:src/routes/signup/Account
 *
 * @param {Object} props - The component's props.
 * @returns {ReactElement} The component's elements.
 */
function SignupAccount(props) {
    const {
        disabled,
        message,
        username,
        password,
        onChange,
        onSubmit
    } = props;

    return <form onSubmit={function(event) {
        event.preventDefault();
        onSubmit && onSubmit(event);
    }}>
        <section>
            <img src={logoImage} />
            <div>
                <h4>Finally, let&rsquo;s set up your account.</h4>
                <h5>Welcome to the Bakery!</h5>
            </div>
        </section>
        <LabeledInput
            type="username"
            label="Username"
            maxLength={USERNAME_MAXLEN}
            required={true}
            disabled={disabled}
            value={username}
            onChange={handleChange(onChange, 'username')}
        />
        <LabeledInput
            type="password"
            label="Password"
            maxLength={PASSWORD_MAXLEN}
            required={true}
            disabled={disabled}
            value={password}
            onChange={handleChange(onChange, 'password')}
        />
        <LabeledInput
            type="password"
            label="Re-type password"
            pattern={`^${escapeStringRegexp(password)}$`}
            required={true}
            disabled={disabled}
        />
        <button
            type="submit"
            disabled={disabled}
        >
            <Octicon icon={Plus} />
            &nbsp;Sign up
        </button>
        {message}
    </form>;
}

SignupAccount.propTypes = {
    disabled: bool,
    message: node,
    username: string,
    password: string,
    onSubmit: func,
    onChange: func.isRequired
};

SignupAccount.defaultProps = {
    username: '',
    password: ''
};

export default SignupAccount;

