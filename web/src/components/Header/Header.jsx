import React from 'react';
import { Link } from 'react-router-dom';
import { useStyles } from './Header.styles';
import clsx from 'clsx';
import { withRouter } from 'react-router-dom';

const Header = ({location}) => {
  const { pathname } = location;
  const classes = useStyles();
  console.log('pathname', pathname);
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
        <Link className={clsx(classes.link, {[classes.selected]: pathname === '/account'})} to="/account">Account</Link>
        <Link className={clsx(classes.link, {[classes.selected]: pathname === '/logout'})} to="/logout">Logout</Link>
      </div>
    </nav>
  </header>
}

export default withRouter(Header);