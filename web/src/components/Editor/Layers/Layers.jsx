import React, {memo, useState, forwardRef, useImperativeHandle, useEffect, useRef} from 'react';
import LayerFrames from './Layer/LayerFrames';
import LayerTools from './Layer/LayerTools';
import { useStyles } from './Layers.styles';
import {
    RecoilRoot,
    atom,
    selector,
    useRecoilState,
    useRecoilValue,
} from 'recoil';
import {currentIndexAtom, layersAtom, isOnionSkinAtom, onionSkinLeftAtom, onionSkinRightAtom, longestLayer, isPlayAtom} from '../Editor.state';
import { FRAME_MARGIN, FRAME_WIDTH, LAYERS_TOOLS_WIDTH } from "../Editor.styles";
import MultipleLabel from './MultipleLabel/MultipleLabel';
import DraggableItem from '../../shared/DraggableItem/DraggableItem';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    TouchSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import clsx from 'clsx';

const Layers = forwardRef((props, ref) => {
    const classes = useStyles();
    const [ layers, setLayers ] = useRecoilState(layersAtom);
    const currentIndex = useRecoilValue(currentIndexAtom);
    const framesLength = useRecoilValue(longestLayer);
    const [multipleRight, setMultipleRight] = useRecoilState(onionSkinRightAtom);
    const [multipleLeft, setMultipleLeft] = useRecoilState(onionSkinLeftAtom);
    const isOnionSkin = useRecoilValue(isOnionSkinAtom);
    const isPlay = useRecoilValue(isPlayAtom);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [scrollPositionTop, setScrollPositionTop] = useState(0);
    const scrollRef = useRef();
    const [currentSortable, setCurrentSortable] = useState(null);
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const setScroll = (e) => {
        setScrollPosition(scrollRef.current.scrollLeft);
        setScrollPositionTop(scrollRef.current.scrollTop);
    }
    const handleDragEnd = (event) => {
        const {active, over} = event;

        if (active.id !== over.id) {
            const oldIndex = layers.indexOf(active.id);
            const newIndex = layers.indexOf(over.id);
            setLayers(arrayMove(layers, oldIndex, newIndex));
        }
    }


    return <div className={classes.layersPanel}>
        {
            isOnionSkin && !isPlay && <>
                <MultipleLabel
                    direction={'left'}
                    count={multipleLeft}
                    setCount={setMultipleLeft}
                    item={{index: currentIndex}}
                    framesLength={framesLength}
                />
                <MultipleLabel
                    direction={'right'}
                    count={multipleRight}
                    setCount={setMultipleRight}
                    item={{index: currentIndex}}
                    framesLength={framesLength}
                />
            </>
        }
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <div className={classes.layersContainer} onScroll={setScroll} ref={scrollRef}>
                <SortableContext
                    items={layers}
                    strategy={verticalListSortingStrategy}
                >
                <div className={classes.index} style={{left: `${currentIndex * (FRAME_WIDTH + 2*FRAME_MARGIN) + LAYERS_TOOLS_WIDTH}px`}}></div>
                <div className={classes.timeline}>
                    {
                        Array.from(Array(Math.max(framesLength, 40))).map((_,i) => (<div className={clsx(classes.frameIndex, {[classes.selectedIndex]: currentIndex === i})} style={{marginLeft: i === 0 ? `-${scrollPosition}px` : undefined}} key={i}>{i+1}</div>))
                    }
                </div>
                {
                    layers.map((layer, index) => <LayerFrames scrollPosition={scrollPosition} index={index} key={layer} id={layer}/>)
                }
                </SortableContext>
            </div>
        </DndContext>
    </div>
});

export default Layers;