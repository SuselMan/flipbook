import React from 'react';
import { useStyles } from './DragIcon.styles';

const DragIcon = (props) => {
  const classes = useStyles();
  const {setActivatorNodeRef, id, listeners} = props;
  return <button className={classes.container} ref={setActivatorNodeRef} {...listeners}>
      <div className={classes.line}/>
      <div className={classes.line}/>
      <div className={classes.line}/>
  </button>
};

export default DragIcon;