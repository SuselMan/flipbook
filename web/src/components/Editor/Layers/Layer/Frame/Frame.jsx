import React from 'react';
import { useStyles } from './Frame.styles';
import clsx from 'clsx';
import { useEditorStore } from '../../../../../stores/editorStore';

const Frame = (props) => {
    const classes = useStyles();
    const { id, layerId, frameIndex, layerIndex } = props;
    const frame = useEditorStore((s) => s.framesMap[id]);
    const setCurrentFrame = useEditorStore((s) => s.setCurrentFrame);
    const currentLayer = useEditorStore((s) => s.currentLayer);
    const setCurrentLayer = useEditorStore((s) => s.setCurrentLayer);
    const currentIndex = useEditorStore((s) => s.currentIndex);
    const setCurrentIndex = useEditorStore((s) => s.setCurrentIndex);
    const range = useEditorStore((s) => s.framesRange);
    const setRange = useEditorStore((s) => s.setFramesRange);
    const createFrameRange = useEditorStore((s) => s.createFrameRange);

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
            createFrameRange({ frameIndex, layerIndex });
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
            {frame?.dataUrl && <img
                alt=""
                className={classes.frameImage}
                src={frame.dataUrl}
            />}
        </div>
    </div>
}

export default Frame;
