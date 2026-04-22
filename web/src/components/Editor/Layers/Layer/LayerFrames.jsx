import React, {forwardRef} from 'react';
import clsx from 'clsx';
import Frame from './Frame/Frame';
import AddFrame from './Frame/AddFrame';
import { useStyles } from './Layer.styles';
import { useEditorStore } from '../../../../stores/editorStore';
import LayerTools from "./LayerTools";
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

// TODO: Check if we need this ref;
const LayerFrames = forwardRef((props, ref) => {
    const { id, index, scrollPosition } = props;
    const layer = useEditorStore((s) => s.layersMap[id]);
    const currentIndex = useEditorStore((s) => s.currentIndex);
    const currentLayer = useEditorStore((s) => s.currentLayer);
    const range = useEditorStore((s) => s.framesRange);
    const classes = useStyles();
    const maxLength = useEditorStore((s) => s.longest);
    const rows  = [];
    const {
        attributes,
        listeners,
        setActivatorNodeRef,
        setNodeRef,
        transform,
        transition,
    } = useSortable({id: props.id});

    if (!layer) return null;

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: layer.isVisible ? 1 : 0.5
    };

    for (let i = 0; i < maxLength; i++) {
        const frameId = layer.frames[i];
        if (frameId) {
            const isSelected = i === currentIndex && id === currentLayer;
            const isInRange = Boolean(
                range &&
                range.from.layerIndex <= index && range.to.layerIndex >= index &&
                range.from.frameIndex <= i && range.to.frameIndex >= i
            );
            rows.push(
                <Frame
                    key={frameId}
                    id={frameId}
                    layerId={id}
                    layerIndex={index}
                    frameIndex={i}
                    isSelected={isSelected}
                    isInRange={isInRange}
                />
            );
        } else {
            rows.push(<AddFrame key={i} layerId={id} position={i}/>);
        }
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