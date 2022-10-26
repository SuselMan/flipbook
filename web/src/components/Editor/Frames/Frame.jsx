import React, { memo, useState } from 'react';
import { useStyles } from './Frames.styles';
import clsx from 'clsx';
import MultipleLabel from './MultipleLabel/MultipleLabel';

const Frame = (props) => {
    const {
        dataUrl,
        setCurrentFrame,
        currentFrame,
        item,
        isMultiple = true,
        multipleLeft = 0,
        multipleRight = 0,
        setMultipleLeft,
        setMultipleRight,
        framesLength = 1,
        isPlay,
    } = props;

    const classes = useStyles();
    const isMultipleFrames = currentFrame === item && isMultiple && !isPlay;

    return <div className={classes.frameWrapper}>
        { isMultipleFrames &&
            <MultipleLabel
                direction={'left'}
                count={multipleLeft}
                setCount={setMultipleLeft}
                item={item}
                framesLength={framesLength}
            />
        }
        <div
            className={clsx(classes.frame, {[classes.selected]: currentFrame === item})}
            onClick={() => {setCurrentFrame(item)}}
        >
            {dataUrl && <img
                className={classes.frameImage}
                src={dataUrl}
            />}
        </div>
        { isMultipleFrames &&
            <MultipleLabel
                direction={'right'}
                count={multipleRight}
                setCount={setMultipleRight}
                item={item}
                framesLength={framesLength}
            />
        }
    </div>
}

export default Frame;