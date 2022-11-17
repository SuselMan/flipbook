import * as uuid from 'uuid';
import { getEmptyFrame, getEmptyLayer } from './Editor.utils';
import { atom, selector, selectorFamily } from 'recoil';
import { TOOLS, TIMELINE_KEYS, EDITOR_KEYS, FRAME_TYPES } from './Editor.constants';

export const isOnionSkinAtom = atom({
    key: EDITOR_KEYS.IS_ONION_SKIN,
    default: false,
});

export const onionSkinLeftAtom = atom({
    key: EDITOR_KEYS.ONION_SKIN_LEFT,
    default: -1,
});

export const onionSkinRightAtom = atom({
    key: EDITOR_KEYS.ONION_SKIN_RIGHT,
    default: 1,
});

export const isPlayAtom = atom({
    key: EDITOR_KEYS.IS_PLAY,
    default: false,
});
export const isColorPickingAtom = atom({
    key: EDITOR_KEYS.IS_COLOR_PICKING,
    default: false,
});
export const isOpacityPickingAtom = atom({
    key: EDITOR_KEYS.IS_OPACITY_PICKING,
    default: false,
});
export const isBrushSizePickingAtom = atom({
    key: EDITOR_KEYS.IS_BRUSH_SIZE_PICKING,
    default: false,
});
export const selectedToolAtom = atom({
    key: EDITOR_KEYS.SELECTED_TOOL,
    default: TOOLS.BRUSH,
});
export const selectedColorAtom = atom({
    key: EDITOR_KEYS.SELECTED_COLOR,
    default: '#ff00a2',
});
export const brushSizeAtom = atom({
    key: EDITOR_KEYS.BRUSH_SIZE,
    default: 5,
});
export const opacityAtom = atom({
    key: EDITOR_KEYS.OPACITY,
    default: 1,
});

export const initialFrame = getEmptyFrame();
export const initialLayer = getEmptyLayer([initialFrame.id]);

export const currentFrameAtom = atom({
    key: TIMELINE_KEYS.CURRENT_FRAME,
    default: initialFrame.id,
});

export const currentLayerAtom = atom({
    key: TIMELINE_KEYS.CURRENT_LAYER,
    default: initialLayer.id,
});

export const currentIndexAtom = atom({
    key: TIMELINE_KEYS.CURRENT_INDEX,
    default: 0,
});

export const framesMap = atom({
    key: TIMELINE_KEYS.FRAMES_MAP,
    default: {
        [initialFrame.id]: initialFrame
    },
});

export const longestLayer = atom({
    key: TIMELINE_KEYS.MAX_LENGTH,
    default: 1,
});

export const layersMap = atom({
    key: TIMELINE_KEYS.LAYERS_MAP,
    default: {
        [initialLayer.id]: initialLayer
    },
});

export const layersAtom = atom({
    key: TIMELINE_KEYS.LAYERS,
    default: [ initialLayer.id ],
});

export const addFrameSelector = selectorFamily({
    key: TIMELINE_KEYS.ADD_FRAME,
    get: () => {},
    set: ({ layerId, position }) => ({set, get}) => {
        const maxLength = get(longestLayer);
        let frames = get(framesMap);
        let layersObj = get(layersMap);
        const layer = layersObj[layerId];
        const layerFrames = [...layer.frames];
        const newFrame = getEmptyFrame();
        frames = { ...frames, [newFrame.id]: newFrame};
        layerFrames[position] = newFrame.id;
        if(maxLength < layerFrames.length) {
            set(longestLayer, layerFrames.length);
        }
        layersObj = {
            ...layersObj,
            [layer.id]: { ...layer, frames: [...layerFrames] },
        };

        set(framesMap, frames);
        set(layersMap, layersObj);
        set(currentFrameAtom, newFrame.id);
        set(currentLayerAtom, layer.id);
        set(currentIndexAtom, position);
    },
});

export const clearFrameSelector = selector({
    key: TIMELINE_KEYS.CLEAR_FRAME,
    get: () => {},
    set: ({set, get}) => {
        let frames = get(framesMap);
        let currentFrameId = get(currentFrameAtom);
        const frame = frames[currentFrameId]

        frames = { ...frames, [currentFrameId]: {...frame, dataUrl: ''}};
        set(framesMap, frames);
    },
});

export const addLayerSelector = selector({
    key: TIMELINE_KEYS.ADD_LAYER_SELECTOR,
    get: () => {},
    set: ({set, get}) => {
        const currentLayer = get(currentLayerAtom);
        const frames = get(framesMap);
        const layersObj = get(layersMap);
        const layersArr = get(layersAtom);
        const newFrame = getEmptyFrame();
        const newLayer = getEmptyLayer([newFrame.id]);
        // TODO: add layer to proper position
        set(framesMap, { ...frames, [newFrame.id]: newFrame });
        set(layersMap, { ...layersObj, [newLayer.id]: newLayer });
        set(layersAtom, [...layersArr, newLayer.id]);
    },
});

export const getSliceSelector = selector({
    key: TIMELINE_KEYS.GET_SLICE,
    get: ({ get }) => {
        const currentIndex = get(currentIndexAtom);
        const layers = get(layersAtom);
        const frames = get(framesMap);
        const layersObj = get(layersMap);
        const slice = layers.map((key) => {
            const dataUrl = frames[layersObj[key].frames[currentIndex]]?.dataUrl;
            return { id: key, dataUrl  }
        });
        return slice.reverse();
    }
});

export const frameSelector = selectorFamily({
    key: TIMELINE_KEYS.FRAME_SELECTOR,
    get: (id) => ({get}) => {
        const frame = get(framesMap)[id];
        return frame;
    },
    set: (id) => ({set, get}, data = {}) => {
        const currentFrame = get(currentFrameAtom);
        const frameId = data.id || currentFrame;
        const frames = get(framesMap);
        const frame = frames[frameId];
        const newFrame = {...frame, ...data}
        return set(framesMap, { ...frames, [frameId]: newFrame });
    },
});

export const nextFrameSelector = selector({
    key: TIMELINE_KEYS.NEXT_FRAME,
    get: ({get}) => {},
    set: ({set, get}, data = {}) => {
        const maxLength = get(longestLayer);
        const currentFrameIndex = get(currentIndexAtom);
        const currentLayer = get(currentLayerAtom);
        const allLayers = get(layersMap);
        const allFrames = get(framesMap);
        let nextIndex =  currentFrameIndex + 1;
        if(nextIndex >= maxLength) {
            nextIndex = 0;
        }
        const newFrame = allLayers[currentLayer].frames[nextIndex];
        set(currentIndexAtom, nextIndex);
        set(currentFrameAtom, newFrame);
    },
});



export const layerSelector = selectorFamily({
    key: TIMELINE_KEYS.LAYER_SELECTOR,
    get: (id) => ({get}) => {
        const layer = get(layersMap)[id];
        console.log('id', layer);
        return layer;
    },
    set: (data = {}) => ({set, get}) => {
        // TODO: todo;
    },
});
