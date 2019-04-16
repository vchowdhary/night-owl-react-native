/**
 * Account deletion button.
 *
 * @module src/User/Delete
 */

import React from 'react';
import { shape, func, string } from 'prop-types';
import { withRouter } from 'react-router-dom';
import Octicon, { X, Trashcan } from '@githubprimer/octicons-react';

import User from 'src/User';
import Modal from 'src/Modal';

import styles from './index.less';

/**
 * Delete button.
 *
 * @param {Object} props - The component's props.
 * @returns {ReactElement} The component's elements.
 */
function DeleteButton(props) {
    const { open } = props;

    return <button className={styles.danger} onClick={open}>
        <Octicon icon={Trashcan} />
        &nbsp;Delete Account
    </button>;
}

DeleteButton.propTypes = {
    open: func
};


/**
 * Confirmation dialog.
 *
 * @param {Object} props - The component's props.
 * @returns {ReactElement} The component's elements.
 */
function Confirmation(props) {
    const { close, doDelete } = props;

    return <div className={styles.modal}>
        <div>
            <h1>Are you sure you want to delete your account?</h1>
            <h2>There&rsquo;s no going back!</h2>
            <form className={styles.buttons}>
                <div role="group">
                    <button
                        type="button"
                        onClick={close}
                    >
                        <Octicon icon={X} />
                        &nbsp;No, do not delete
                    </button>
                    <button
                        type="button"
                        className={styles.danger}
                        onClick={doDelete}
                    >
                        <Octicon icon={Trashcan} />
                        &nbsp;Yes, delete
                    </button>
                </div>
            </form>
        </div>
    </div>;
}

Confirmation.propTypes = {
    close: func,
    doDelete: func.isRequired
};


/**
 * Account deletion button.
 *
 * @alias module:src/User/Delete
 *
 * @param {Object} props - The component's props.
 * @returns {ReactElement} The component's elements.
 */
function Delete(props) {
    if (!User.loggedIn) {
        return null;
    }

    const { history, className } = props;

    /**
     * Performs the deletion.
     */
    async function doDelete() {
        await User.delete();
        history.replace('/');
    }

    const { enter, enterActive, exit, exitActive } = styles;

    return <Modal
        className={className}
        button={<DeleteButton />}
        transition={{
            appear: true,
            classNames: {
                enter, enterActive, exit, exitActive,
                appear: enter,
                appearActive: enterActive
            },
            timeout: 300
        }}
    >
        <Confirmation doDelete={doDelete} />
    </Modal>;
}

Delete.propTypes = {
    history: shape({
        replace: func.isRequired
    }).isRequired,
    className: string
};

export default withRouter(Delete);

