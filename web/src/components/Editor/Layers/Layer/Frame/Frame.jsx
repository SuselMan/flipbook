import React from 'react';
import { useStyles } from './Frame.styles';
import clsx from 'clsx';
import { frameSelector } from '../../../Editor.state';
import {
    RecoilRoot,
    atom,
    selector,
    useRecoilState,
    useSetRecoilState,
    useRecoilValue,
} from 'recoil';
import { currentFrameAtom, currentLayerAtom, currentIndexAtom } from '../../../Editor.state';
import { FRAME_TYPES } from '../../../Editor.constants';

const Frame = (props) => {
    const classes = useStyles();
    const { id, layerId, frameIndex } = props;
    const [frame] = useRecoilState(frameSelector(id))
    const [ currentFrame, setCurrentFrame ] = useRecoilState(currentFrameAtom);
    const setCurrentLayer = useSetRecoilState(currentLayerAtom);
    const setCurrentIndex = useSetRecoilState(currentIndexAtom);

    return <div className={classes.frameWrapper}>
        <div
            className={clsx(classes.frame, { [classes.selected]: currentFrame === id })}
            onClick={() => {setCurrentFrame(id); setCurrentLayer(layerId); setCurrentIndex(frameIndex)}}
            onContextMenu={(e) => e.preventDefault()}
        >
            {frame.dataUrl && <img
                className={classes.frameImage}
                src={frame.dataUrl}
            />}
        </div>
    </div>
}

export default Frame;