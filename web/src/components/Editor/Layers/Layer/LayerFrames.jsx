import React, {memo, useState, forwardRef, useImperativeHandle, useEffect} from 'react';
import Frame from './Frame/Frame';
import AddFrame from './Frame/AddFrame';
import { useStyles } from './Layer.styles';
import { layerSelector, longestLayer } from '../../Editor.state';
import {
    useRecoilState,
    useRecoilValue,
} from 'recoil';

// TODO: Check if we need this ref;
const LayerFrames = forwardRef((props, ref) => {
    const { id } = props;
    const [ layer ] = useRecoilState(layerSelector(id))
    const classes = useStyles();
    const maxLength = useRecoilValue(longestLayer);
    const rows  = [];
    for (let i = 0; i < maxLength; i++) {
        const item = layer.frames[i]
            ? <Frame key={layer.frames[i]} id={layer.frames[i]} layerId={id} frameIndex={i}/>
            :  <AddFrame key={i} layerId={id} position={i}/>
        rows.push(item);
    }

    return <div className={classes.frames}>
        {
            rows
        }
        <AddFrame key={`addFrame-${id}`} layerId={id} position={rows.length}/>
    </div>
});

export default LayerFrames;