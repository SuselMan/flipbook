import React, {memo, useState, forwardRef, useImperativeHandle, useEffect} from 'react';
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
import {FRAME_MARGIN, FRAME_WIDTH } from "../Editor.styles";
import MultipleLabel from "../Frames/MultipleLabel/MultipleLabel";

const Layers = forwardRef((props, ref) => {
    const classes = useStyles();
    const [ layers, setLayers ] = useRecoilState(layersAtom);
    const currentIndex = useRecoilValue(currentIndexAtom);
    const framesLength = useRecoilValue(longestLayer);
    const [multipleRight, setMultipleRight] = useRecoilState(onionSkinRightAtom);
    const [multipleLeft, setMultipleLeft] = useRecoilState(onionSkinLeftAtom);
    const isOnionSkin = useRecoilValue(isOnionSkinAtom);
    const isPlay = useRecoilValue(isPlayAtom);

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
        <div className={classes.layersTools}>
            {
                layers.map((layer) => <LayerTools key={layer} id={layer}/>)
            }
        </div>
        <div className={classes.layersContainer}>
            <div className={classes.index} style={{left: `${currentIndex * (FRAME_WIDTH + 2*FRAME_MARGIN)}px`}}></div>
            {
                layers.map((layer) => <LayerFrames key={layer} id={layer}/>)
            }
        </div>
    </div>
});

export default Layers;