/**
 * Input with a corresponding label.
 *
 * @module src/LabeledInput
 */

import React from 'react';
import { string, bool } from 'prop-types';
import classNames from 'classnames';

import styles from './index.less';

/**
 * Input with label.
 *
 * @private
 * @param {Object} props - The component's props.
 * @returns {ReactElement} The component's elements.
 */
function LabeledInput(props) {
    const { label, placeholder = label, ...rest } = props;

    const classes = classNames(styles.label, {
        [styles.required]: props.required
    });

    const text = <span className={classes}>{label}</span>;
    const input = <input placeholder={placeholder} {...rest} />;

    return <label className={styles.label}>
        {text}
        {input}
    </label>;
}

LabeledInput.propTypes = {
    label: string.isRequired,
    placeholder: string,
    required: bool
};

export default LabeledInput;

