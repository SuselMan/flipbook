import React, { memo } from 'react';
import { useStyles } from './Frame.styles';
import clsx from 'clsx';
import { useEditorStore } from '../../../../../stores/editorStore';

const Frame = memo((props) => {
    const classes = useStyles();
    const { id, layerId, frameIndex, layerIndex, isSelected, isInRange } = props;
    const frame = useEditorStore((s) => s.framesMap[id]);
    const setCurrentFrame = useEditorStore((s) => s.setCurrentFrame);
    const setCurrentLayer = useEditorStore((s) => s.setCurrentLayer);
    const setCurrentIndex = useEditorStore((s) => s.setCurrentIndex);
    const setRange = useEditorStore((s) => s.setFramesRange);
    const createFrameRange = useEditorStore((s) => s.createFrameRange);

    const onFrameClick = (e) => {
        if (e.shiftKey) {
            createFrameRange({ frameIndex, layerIndex });
            return;
        }
        setRange(null);
        setCurrentFrame(id);
        setCurrentLayer(layerId);
        setCurrentIndex(frameIndex);
    };

    return <div className={clsx(classes.frameWrapper, { [classes.first]: frameIndex === 0 })}>
        <div
            className={clsx(classes.frame, { [classes.selected]: isSelected })}
            onClick={onFrameClick}
            onContextMenu={(e) => e.preventDefault()}
        >
            {isInRange && <div className={classes.inRange}/>}
            {frame?.dataUrl && <img
                alt=""
                className={classes.frameImage}
                src={frame.dataUrl}
            />}
        </div>
    </div>;
});

export default Frame;
