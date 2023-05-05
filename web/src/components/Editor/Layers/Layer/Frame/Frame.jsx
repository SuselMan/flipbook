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
import { currentFrameAtom, currentLayerAtom, currentIndexAtom, createFrameRangeSelector, framesRangeAtom } from '../../../Editor.state';
import { FRAME_TYPES } from '../../../Editor.constants';

const Frame = (props) => {
    const classes = useStyles();
    const { id, layerId, frameIndex, layerIndex } = props;
    const [frame] = useRecoilState(frameSelector(id))
    const [ currentFrame, setCurrentFrame ] = useRecoilState(currentFrameAtom);
    const [ currentLayer, setCurrentLayer ] = useRecoilState(currentLayerAtom);
    const [ currentIndex, setCurrentIndex ] = useRecoilState(currentIndexAtom);
    const [range, setRange] = useRecoilState(framesRangeAtom);
    const createRange = useSetRecoilState(createFrameRangeSelector({ frameIndex, layerIndex }));
    const checkIsFrameInRange = () => {
        if(range && range.from.layerIndex <= layerIndex && range.from.frameIndex <= frameIndex ) {
            if(range.to.layerIndex >= layerIndex && range.to.frameIndex >= frameIndex) {
                return true;
            }
        }
        return false;
    }
    const isFrameInRange = checkIsFrameInRange();
    const onFrameClick = (e) => {
        if(e.shiftKey) {
            createRange();
            return;
        }
        setRange(null);
        setCurrentFrame(id);
        setCurrentLayer(layerId);
        setCurrentIndex(frameIndex)
    }
    return <div className={clsx(classes.frameWrapper, {[classes.first]: frameIndex === 0})}>
        <div
            className={clsx(classes.frame, { [classes.selected]: frameIndex === currentIndex && layerId === currentLayer })}
            onClick={onFrameClick}
            onContextMenu={(e) => e.preventDefault()}
        >
            {isFrameInRange && <div className={classes.inRange}/>}
            {frame.dataUrl && <img
                className={classes.frameImage}
                src={frame.dataUrl}
            />}
            {/*<span className={classes.index}>*/}
            {/*    {frameIndex + 1}*/}
            {/*</span>*/}
        </div>
    </div>
}

export default Frame;