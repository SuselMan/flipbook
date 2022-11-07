import React from 'react';
import { Link } from 'react-router-dom';
import { useStyles } from './Header.styles';
import clsx from 'clsx';
import { withRouter } from 'react-router-dom';
import {
  useRecoilValue,
} from 'recoil';
import { userNameSelector } from '../../state/User/User';

const Header = ({location}) => {
  const { pathname } = location;
  const classes = useStyles();
  const userName = useRecoilValue(userNameSelector);

  return <header className={classes.header}>
    <nav>
      <div className={classes.leftPanel}>
        <Link className={clsx(classes.link, {[classes.selected]: pathname === '/hot'})} to="/hot">Hot</Link>
        <Link className={clsx(classes.link, {[classes.selected]: pathname === '/new'})} to="/new">New</Link>
        <Link className={clsx(classes.link, {[classes.selected]: pathname === '/top'})} to="/top">Top</Link>
      </div>
      <div className={classes.centerPanel}>
        <Link className={classes.link} to="/add"><button className={classes.addButton}>+</button></Link>
      </div>
      <div className={classes.rightPanel}>
        {userName
          ? <Link className={clsx(classes.link, classes.bold, {[classes.selected]: pathname === '/profile'})} to="/profile">{userName}</Link>
          : <Link className={clsx(classes.link,  {[classes.selected]: pathname === '/login'})} to="/login">Sign in</Link>
        }
        {
          !userName && <Link className={clsx(classes.link,  {[classes.selected]: pathname === '/register'})} to="/register">Sign up</Link>
        }
      </div>
    </nav>
  </header>
}

export default withRouter(Header);