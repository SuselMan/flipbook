import React, { memo, useState } from 'react';
import { useStyles } from './Frames.styles';
import clsx from 'clsx';
const Frames = ({ currentFrameIndex = 0, setSelectedFrame, frames = [] }) => {
  const classes = useStyles();

  const selectFrame = (index) => {
    setSelectedFrame(index)
  }
  console.log('frames', frames);
  return <div className={classes.frames}>
    {
      frames.map((item, index) => <div onClick={() => {selectFrame(index)}} key={index} className={clsx(classes.frame, {[classes.selected]: currentFrameIndex === index})}>
        <div>
          <span className={classes.index}>{index + 1}</span>
          {item && <img className={classes.image} src={item}/>}
        </div>
      </div>)
    }
  </div>
}

export default memo(Frames);