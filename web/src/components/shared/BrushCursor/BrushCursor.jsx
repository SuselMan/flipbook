import React from 'react';
import { useStyles } from './BrushCursor.styles';

const BrushCursor = (props) => {
  const classes = useStyles();
  const {size, x, y, isVisible} = props;
  return <div className={classes.brush} style={{
    top: y,
    left: x,
    width: `${size}px`,
    height: `${size}px`,
    marginLeft: `-${size/2}px`,
    marginTop: `-${size/2}px`,
    display: isVisible ? 'block' : 'none'
  }}/>
};

export default BrushCursor;