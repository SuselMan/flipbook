import React from 'react';
import { useStyles } from './Frame.styles';
import clsx from 'clsx';
import {addFrameSelector, frameSelector} from '../../../Editor.state';
import {
    RecoilRoot,
    atom,
    selector,
    useRecoilState,
    useSetRecoilState,
    useRecoilValue,
} from 'recoil';
import { currentFrameAtom, currentLayerAtom, currentIndexAtom } from '../../../Editor.state';

const AddFrame = ({ layerId, position }) => {
    const classes = useStyles();
    const addFrame = useSetRecoilState(addFrameSelector({ layerId, position}));
    return <div className={classes.pointFrame} onClick={addFrame}>
        <div className={classes.point}></div>
        <span> + </span>
    </div>
}

export default AddFrame;