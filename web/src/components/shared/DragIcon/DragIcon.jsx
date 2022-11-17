import React from 'react';
import { useStyles } from './DragIcon.styles';

const DragIcon = () => {
  const classes = useStyles();
  return <button className={classes.container}>
      <div className={classes.line}/>
      <div className={classes.line}/>
      <div className={classes.line}/>
  </button>
};

export default DragIcon;