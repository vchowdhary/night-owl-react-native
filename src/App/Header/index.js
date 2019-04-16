/**
 * App header.
 *
 * @module src/App/Header
 */

import React from 'react';
import { withRouter, NavLink, Route } from 'react-router-dom';
import Octicon, { Person } from '@githubprimer/octicons-react';

import User from 'src/User';
import Login from 'src/Login';
import Logout from 'src/Logout';
import ButtonLink from 'src/ButtonLink';
import Counter from 'src/Counter';

import DropdownNav from './DropdownNav';

import styles from './index.less';

const LoginWithRouter = withRouter(Login);

/**
 * Logo component.
 *
 * @private
 *
 * @returns {ReactElement} The component's elements.
 */
function Logo() {
    return <NavLink
        className={styles.logo}
        activeClassName={styles.active}
        to="/"
        exact={true}
    >
        <div className={styles.image} />
        <div className={styles.text} />
        <Route path="/" exact={true} render={() => {
            return <h4 className={styles.counter}>
                <Counter end={2000} />
            </h4>;
        }} />
    </NavLink>;
}

/**
 * Account toolbar component.
 *
 * @private
 *
 * @returns {ReactElement} The component's elements.
 */
function Account() {
    const title = [
        <Octicon key='icon' icon={Person} />,
        <span key='text'>&nbsp;{User.id || 'Account'}</span>
    ];

    let menu;
    if (User.loggedIn) {
        menu = [
            <Logout key="logout" />,
            <ButtonLink key="profile" to="/profile/">
                <Octicon icon={Person} />
                &nbsp;My Profile
            </ButtonLink>,
            <ButtonLink key="map" to="/map/">
                <Octicon icon={Person} />
                &nbsp;Map
            </ButtonLink>,
            <ButtonLink key = "matchrequest" to= "/matchrequest/">
                <Octicon icon = {Person} />
                &nbsp;Make a Request
            </ButtonLink>,
            <ButtonLink key = "matchoffer" to= "/matchoffer/">
                <Octicon icon = {Person} />
                &nbsp;Make an Offer
            </ButtonLink>
        ];
    } else {
        menu = [
            <LoginWithRouter key="login" onClick={event => {
                if (event.target.onclick) {
                    return;
                }

                event.stopPropagation();
            }} />
        ];
    }

    return <nav className={styles.account}>
        <DropdownNav menuClassName={styles.menu} title={title}>
            {menu}
        </DropdownNav>
    </nav>;
}

/**
 * Header component.
 *
 * @alias module:src/Header
 *
 * @returns {ReactElement} The component's elements.
 */
function Header() {
    return <header className={styles.header}>
        <Logo />
        <Account />
    </header>;
}

export default Header;

