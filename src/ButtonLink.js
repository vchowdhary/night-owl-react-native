/**
 * Button link component.
 *
 * @module src/ButtonLink
 */

import React from 'react';
import { oneOfType, shape, func, string, bool, node } from 'prop-types';
import { withRouter } from 'react-router-dom';

/**
 * Button link component.
 *
 * @alias module:src/ButtonLink
 *
 * @param {Object} props - The component's props.
 * @returns {ReactElement} The component's elements.
 */
function ButtonLink(props) {
    const {
        history, to,
        push = true,
        className, disabled, children
    } = props;

    return <button
        className={className}
        disabled={disabled}
        onClick={function() {
            push
                ? history.push(to)
                : history.replace(to);
        }}
    >
        {children}
    </button>;
}

ButtonLink.propTypes = {
    history: shape({
        push: func.isRequired,
        replace: func.isRequired
    }).isRequired,
    to: oneOfType([
        string,
        shape({
            pathname: string.isRequired
        })
    ]).isRequired,
    push: bool,
    className: string,
    disabled: bool,
    children: node
};

export default withRouter(ButtonLink);

