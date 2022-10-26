import React from 'react';
import { useStyles } from './RoundButton.styles';
import clsx from 'clsx';

const RoundButton = ({ isPressed, children, iconColor, ...rest }) => {
  const classes = useStyles();
  return <button
      {...rest}
      style={{fill: iconColor}}
      className={
          clsx(classes.button, { pressed: isPressed, [classes.withIcon]: !iconColor })
      }
  >
    { children }
  </button>
};

export default RoundButton;