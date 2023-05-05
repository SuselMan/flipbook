import React from 'react';
import { useStyles } from './Frame.styles';
import clsx from 'clsx';
import {addFrameByPositionSelector, frameSelector} from '../../../Editor.state';
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
    const addFrame = useSetRecoilState(addFrameByPositionSelector({ layerId, position}));
    return <div className={clsx(classes.pointFrame, {[classes.first]: position === 0})} onClick={addFrame}>
        <div className={classes.point}></div>
        <span> + </span>
    </div>
}

export default AddFrame;