import React from 'react';
import { useStyles } from './RoundButton.styles';
import clsx from 'clsx';

const RoundButton = ({ isPressed, children, iconColor, type='big', borderColor, ...rest }) => {
  const classes = useStyles();
  return <button
      {...rest}
      style={{
          fill: iconColor,
          border: `2px solid ${borderColor || 'transparent'}`,
          boxShadow: isPressed && borderColor ? `0px 0px 100px 0px ${borderColor}` : undefined
  }}
      className={
          clsx(classes.button, {
              pressed: isPressed, [classes.withIcon]: !iconColor, [classes.small]: type === 'small' })
      }
  >
    { children }
  </button>
};

export default RoundButton;