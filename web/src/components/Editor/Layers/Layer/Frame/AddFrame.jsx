import React, { memo } from 'react';
import { useStyles } from './Frame.styles';
import clsx from 'clsx';
import { useEditorStore } from '../../../../../stores/editorStore';

const AddFrame = memo(({ layerId, position }) => {
    const classes = useStyles();
    const addFrameByPosition = useEditorStore((s) => s.addFrameByPosition);
    const addFrame = () => addFrameByPosition({ layerId, position });
    return <div className={clsx(classes.pointFrame, {[classes.first]: position === 0})} onClick={addFrame}>
        <div className={classes.point}></div>
        <span> + </span>
    </div>;
});

export default AddFrame;
