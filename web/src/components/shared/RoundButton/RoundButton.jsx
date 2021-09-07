import React from 'react';
import { useStyles } from './RoundButton.styles';

const RoundButton = ({ children, ...rest }) => {
  const classes = useStyles();
  return <button className={classes.button} {...rest}>
    { children }
  </button>
};

export default RoundButton;