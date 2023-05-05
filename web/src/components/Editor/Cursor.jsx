
import React from 'react';
import { useStyles } from './Editor.styles';

const Cursor = (props) => {
    const classes = useStyles();
    const {x,y, size} = props;
    return <div className={classes.cursor} style={{top: `${y}px`, left: `${x}px`, width: `${size}px`, height: `${size}px`}}>

    </div>
};

export default Cursor;