import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { useStyles } from './Header.styles';
import clsx from 'clsx';
import { isAuthenticated, logout } from '../../modules/API/API';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import Avatar from '../shared/Avatar/Avatar';

const Header = ({ location }) => {
    const { pathname } = location;
    const classes = useStyles();
    const loggedIn = isAuthenticated();
    const { data: me } = useCurrentUser();

    return (
        <header className={classes.header}>
            <nav>
                <div className={classes.leftPanel}>
                    <Link className={clsx(classes.link, { [classes.selected]: pathname === '/feed/hot' })} to="/feed/hot">Hot</Link>
                    <Link className={clsx(classes.link, { [classes.selected]: pathname === '/feed/new' || pathname === '/feed' })} to="/feed/new">New</Link>
                    <Link className={clsx(classes.link, { [classes.selected]: pathname === '/feed/top' })} to="/feed/top">Top</Link>
                </div>
                <div className={classes.centerPanel}>
                    <Link className={classes.link} to="/"><button className={classes.addButton}>+</button></Link>
                </div>
                <div className={classes.rightPanel}>
                    {loggedIn && me ? (
                        <>
                            <Link
                                className={clsx(classes.link, classes.bold, { [classes.selected]: pathname === '/me' })}
                                to="/me"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                            >
                                <Avatar
                                    src={me.avatarUrl}
                                    username={me.username}
                                    displayName={me.displayName}
                                    size={28}
                                />
                                <span>{me.displayName || me.username}</span>
                            </Link>
                            <button
                                className={classes.link}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }}
                                onClick={logout}
                            >Sign out</button>
                        </>
                    ) : (
                        <>
                            <Link className={clsx(classes.link, { [classes.selected]: pathname === '/login' })} to="/login">Sign in</Link>
                            <Link className={clsx(classes.link, { [classes.selected]: pathname === '/register' })} to="/register">Sign up</Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default withRouter(Header);
