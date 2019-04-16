/**
 * Basic information form.
 *
 * @module src/routes/signup/Basic
 */

import React from 'react';
import { bool, string, func } from 'prop-types';

import LabeledInput from '../../LabeledInput';

//import logoImage from 'public/images/logo-notext.svg';

/**
 * Maximum text field length.
 *
 * @private
 * @readonly
 * @type {number}
 */
const TEXT_MAXLEN = 255;

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
 * Basic information form.
 *
 * @alias module:src/routes/signup/Basic
 *
 * @param {Object} props - The component's props.
 * @returns {ReactElement} The component's elements.
 */
function SignupBasic(props) {
    const {
        disabled,
        nameFirst,
        nameLast,
        phone,
        onChange
    } = props;

    return <form>
        <section>
            <img src={logoImage} />
            <div>
                <h4>Let&rsquo;s get started.</h4>
                <h5>
                    First, we&rsquo;ll need some basic information.
                </h5>
            </div>
        </section>
        <div role="group">
            <LabeledInput
                type="text"
                label="First name"
                maxLength={TEXT_MAXLEN}
                required={true}
                disabled={disabled}
                value={nameFirst}
                onChange={handleChange(onChange, 'nameFirst')}
            />
            <LabeledInput
                type="text"
                label="Last name"
                maxLength={TEXT_MAXLEN}
                required={true}
                disabled={disabled}
                value={nameLast}
                onChange={handleChange(onChange, 'nameLast')}
            />
        </div>
        <div role="group">
            <LabeledInput
                type="tel"
                label="Phone #"
                placeholder="123-456-7890"
                maxLength={TEXT_MAXLEN}
                disabled={disabled}
                value={phone}
                onChange={handleChange(onChange, 'phone')}
            />
        </div>
    </form>;
}

SignupBasic.propTypes = {
    disabled: bool,
    nameFirst: string,
    nameLast: string,
    phone: string,
    onChange: func.isRequired
};

SignupBasic.defaultProps = {
    nameFirst: '',
    nameLast: '',
    phone: ''
};

export default SignupBasic;

