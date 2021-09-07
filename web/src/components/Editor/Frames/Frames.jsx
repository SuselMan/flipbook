import React, { memo, useState } from 'react';
import { useStyles } from './Frames.styles';
import clsx from 'clsx';
const Frames = ({ frames = [] }) => {
  const [selected, setSelected] = useState(frames[0] || null)
  const classes = useStyles();
  return <div className={classes.frames}>
    {
      frames.map((item, index) => <div onClick={() => {setSelected(item)}} key={item} className={clsx(classes.frame, {[classes.selected]: selected === item})}>{index + 1}</div>)
    }
  </div>
}

export default memo(Frames);