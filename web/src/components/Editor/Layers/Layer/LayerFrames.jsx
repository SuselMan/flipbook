import React, {memo, useState, forwardRef, useImperativeHandle, useEffect} from 'react';
import clsx from 'clsx';
import Frame from './Frame/Frame';
import AddFrame from './Frame/AddFrame';
import { useStyles } from './Layer.styles';
import { layerSelector, longestLayer } from '../../Editor.state';
import {
    useRecoilState,
    useRecoilValue,
} from 'recoil';
import LayerTools from "./LayerTools";
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

// TODO: Check if we need this ref;
const LayerFrames = forwardRef((props, ref) => {
    const { id, index, scrollPosition } = props;
    const [ layer ] = useRecoilState(layerSelector(id))
    const classes = useStyles();
    const maxLength = useRecoilValue(longestLayer);
    const rows  = [];
    const {
        attributes,
        listeners,
        setActivatorNodeRef,
        setNodeRef,
        transform,
        transition,
    } = useSortable({id: props.id});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: layer.isVisible ? 1 : 0.5
    };

    for (let i = 0; i < maxLength; i++) {
        const item = layer.frames[i]
            ? <Frame key={layer.frames[i]} id={layer.frames[i]} layerId={id} layerIndex={index} frameIndex={i}/>
            :  <AddFrame key={i} layerId={id} position={i}/>
        rows.push(item);
    }

    return <div  ref={setNodeRef} style={style} {...attributes} handle="true" className={clsx(classes.frames, {[classes.first]: index === 0} )}>
        <LayerTools id={id} index={index} scrollPosition={scrollPosition} setActivatorNodeRef={setActivatorNodeRef} listeners={listeners}/>
        {
            rows
        }
        <AddFrame key={`addFrame-${id}`} layerId={id} position={rows.length}/>
    </div>
});

export default LayerFrames;