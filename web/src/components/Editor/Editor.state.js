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

export const framesRangeAtom = atom({
    key: TIMELINE_KEYS.RANGE,
    default: null,
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

export const addFrameByPositionSelector = selectorFamily({
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

export const addFrameSelector = selector({
    key: TIMELINE_KEYS.ADD_FRAME,
    get: () => {},
    set: ({set, get}) => {
        const maxLength = get(longestLayer);
        const layerId = get(currentLayerAtom);
        const currentFrameIndex = get(currentIndexAtom);
        let frames = get(framesMap);
        let layersObj = get(layersMap);
        const layer = layersObj[layerId];
        const layerFrames = [...layer.frames];
        const newFrame = getEmptyFrame();
        frames = { ...frames, [newFrame.id]: newFrame};
        layerFrames.splice(currentFrameIndex + 1, 0, newFrame.id);
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
        set(currentIndexAtom, currentFrameIndex + 1);
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

export const deleteFrameSelector = selector({
    key: TIMELINE_KEYS.DELETE_FRAME,
    get: () => {},
    set: ({set, get}) => {
        const currentFrameId = get(currentFrameAtom);
        const currentFrameIndex = get(currentIndexAtom);
        const frames = get(framesMap);
        const layers = get(layersMap);
        const currentLayerId = get(currentLayerAtom);
        const layer = [...layers[currentLayerId].frames];
        const layersArr = get(layersAtom);
        layer[currentFrameIndex] = undefined;
        if (currentFrameId) {
            const newFrames  = { ...frames };
            delete newFrames[currentFrameId];
            set(layersMap, {
                ...layers,
                [currentLayerId]: {
                    ...layers[currentLayerId],
                    frames: layer
                }
            });
            set(framesMap, newFrames);
            set(currentFrameAtom, null)
        } else {
            layer.splice(currentFrameIndex, 1);
            set(layersMap, {
                ...layers,
                [currentLayerId]: {
                    ...layers[currentLayerId],
                    frames: layer
                }
            });
            set(currentFrameAtom, layer[currentFrameIndex]?.id || null);
            let length = 0;
            layersArr.forEach((layerId) => {
                const len = layerId === currentLayerId ? layer.length : layers[layerId].frames.length;
                length = Math.max(length, len);
            });
            set(longestLayer, length);
        }
        // let currentFrameId = get(currentFrameAtom);
        // const frame = frames[currentFrameId]
        //
        // frames = { ...frames, [currentFrameId]: {...frame, dataUrl: ''}};
        // set(framesMap, frames);
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

export const deleteLayerSelector = selector({
    key: TIMELINE_KEYS.DELETE_LAYER,
    get: () => {},
    set: ({set, get}, id) => {
        const layersObj =  {...get(layersMap)};
        const layersArr = [...get(layersAtom)];
        const index = layersArr.indexOf(id);
        if (index > -1) { // only splice array when item is found
            layersArr.splice(index, 1); // 2nd parameter means remove one item only
        }
        delete layersObj[id];
        set(layersMap, layersObj);
        set(currentLayerAtom, layersArr[index]);
        set(layersAtom, layersArr);


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
            return { id: key, dataUrl, isVisible: layersObj[key].isVisible }
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
    set: () => ({set, get}, data = {}) => {
        const currentFrame = get(currentFrameAtom);
        const currentFrameIndex = get(currentIndexAtom);
        const frameId = data.id || currentFrame;
        const frames = get(framesMap);
        const layers = get(layersMap);
        const currentLayerId = get(currentLayerAtom);
        const frame = frames[frameId] || getEmptyFrame();
        const newFrame = {...frame, ...data};
        set(framesMap, { ...frames, [newFrame.id]: newFrame });
        if(!frameId) {
            const frames = [...layers[currentLayerId].frames];
            frames[currentFrameIndex] = newFrame.id;
            set(layersMap, {
                ...layers,
                [currentLayerId]: {
                    ...layers[currentLayerId],
                    frames,
                }
            });
            set(currentFrameAtom, frame.id);
        }
    },
});

export const createFrameRangeSelector = selectorFamily({
    key: TIMELINE_KEYS.CREATE_RANGE,
    get: () => {},
    set: ({ layerIndex, frameIndex }) => ({set, get}) => {
        const currentFrameIndex = get(currentIndexAtom);
        const currentLayerId = get(currentLayerAtom);
        const layers = get(layersAtom);
        const currentLayerIndex = layers.findIndex((id) => id === currentLayerId);
        set(framesRangeAtom, {
            from: {
                frameIndex: Math.min(frameIndex,currentFrameIndex),
                layerIndex: Math.min(layerIndex, currentLayerIndex),
            },
            to: {
                frameIndex: Math.max(frameIndex,currentFrameIndex),
                layerIndex: Math.max(layerIndex, currentLayerIndex),
            }
        })
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
        return layer;
    },
    set: (id) => ({set, get}, data) => {
        const layers = get(layersMap);
        const currentLayer = layers[id];
        const newLayer = {...currentLayer, ...data};
        set(layersMap, {...layers, [id]: newLayer})
    },
});
