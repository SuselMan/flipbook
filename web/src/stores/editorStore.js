import { create } from 'zustand';
import { shallow } from 'zustand/shallow';
import { getEmptyFrame, getEmptyLayer } from '../components/Editor/Editor.utils';
import { TOOLS } from '../components/Editor/Editor.constants';

const MAX_HISTORY = 30;

export const initialFrame = getEmptyFrame();
export const initialLayer = getEmptyLayer([initialFrame.id]);

const captureSnapshot = (s) => ({
  layers: s.layers,
  layersMap: s.layersMap,
  framesMap: s.framesMap,
  currentFrame: s.currentFrame,
  currentLayer: s.currentLayer,
  currentIndex: s.currentIndex,
  longest: s.longest,
});

const applySnapshot = (snap) => ({
  layers: snap.layers,
  layersMap: snap.layersMap,
  framesMap: snap.framesMap,
  currentFrame: snap.currentFrame,
  currentLayer: snap.currentLayer,
  currentIndex: snap.currentIndex,
  longest: snap.longest,
});

const applyUpdater = (prev, v) => (typeof v === 'function' ? v(prev) : v);

export const useEditorStore = create((set, get) => ({
  // ===== UI =====
  isOnionSkin: false,
  onionSkinLeft: -1,
  onionSkinRight: 1,
  isPlay: false,
  isColorPicking: false,
  isOpacityPicking: false,
  isBrushSizePicking: false,
  selectedTool: TOOLS.BRUSH,
  selectedColor: '#ff00a2',
  brushSize: 5,
  opacity: 1,

  // ===== Timeline =====
  currentFrame: initialFrame.id,
  currentLayer: initialLayer.id,
  currentIndex: 0,
  framesRange: null,
  framesMap: { [initialFrame.id]: initialFrame },
  layersMap: { [initialLayer.id]: initialLayer },
  layers: [initialLayer.id],
  longest: 1,

  // ===== History =====
  history: { past: [], future: [] },

  // ===== UI setters =====
  setIsOnionSkin: (v) => set((s) => ({ isOnionSkin: applyUpdater(s.isOnionSkin, v) })),
  setOnionSkinLeft: (v) => set({ onionSkinLeft: v }),
  setOnionSkinRight: (v) => set({ onionSkinRight: v }),
  setIsPlay: (v) => set((s) => ({ isPlay: applyUpdater(s.isPlay, v) })),
  setIsColorPicking: (v) => set({ isColorPicking: v }),
  setIsOpacityPicking: (v) => set({ isOpacityPicking: v }),
  setIsBrushSizePicking: (v) => set({ isBrushSizePicking: v }),
  setSelectedTool: (v) => set((s) => ({ selectedTool: applyUpdater(s.selectedTool, v) })),
  setSelectedColor: (v) => set({ selectedColor: v }),
  setBrushSize: (v) => set((s) => ({ brushSize: applyUpdater(s.brushSize, v) })),
  setOpacity: (v) => set({ opacity: v }),

  // ===== Timeline setters =====
  setCurrentFrame: (v) => set({ currentFrame: v }),
  setCurrentLayer: (v) => set({ currentLayer: v }),
  setCurrentIndex: (v) => set({ currentIndex: v }),
  setFramesRange: (v) => set({ framesRange: v }),
  setFramesMap: (v) => set({ framesMap: v }),
  setLayersMap: (v) => set({ layersMap: v }),
  setLayers: (v) => set((s) => ({ layers: applyUpdater(s.layers, v) })),
  setLongest: (v) => set({ longest: v }),

  // ===== Frame / Layer updates =====
  updateFrame: (data = {}) => {
    const { currentFrame, currentIndex, framesMap, layersMap, currentLayer } = get();
    const frameId = data.id || currentFrame;
    const frame = framesMap[frameId] || getEmptyFrame();
    const newFrame = { ...frame, ...data };
    const patch = { framesMap: { ...framesMap, [newFrame.id]: newFrame } };
    if (!frameId) {
      const frames = [...layersMap[currentLayer].frames];
      frames[currentIndex] = newFrame.id;
      patch.layersMap = {
        ...layersMap,
        [currentLayer]: { ...layersMap[currentLayer], frames },
      };
      patch.currentFrame = frame.id;
    }
    set(patch);
  },

  updateLayer: (id, data) => {
    const { layersMap } = get();
    const layer = layersMap[id];
    set({ layersMap: { ...layersMap, [id]: { ...layer, ...data } } });
  },

  // ===== Frame actions =====
  addFrameByPosition: ({ layerId, position }) => {
    const { longest, framesMap, layersMap } = get();
    const layer = layersMap[layerId];
    const layerFrames = [...layer.frames];
    const newFrame = getEmptyFrame();
    layerFrames[position] = newFrame.id;
    set({
      framesMap: { ...framesMap, [newFrame.id]: newFrame },
      layersMap: { ...layersMap, [layer.id]: { ...layer, frames: [...layerFrames] } },
      currentFrame: newFrame.id,
      currentLayer: layer.id,
      currentIndex: position,
      longest: Math.max(longest, layerFrames.length),
    });
  },

  addFrame: () => {
    const { longest, currentLayer, currentIndex, framesMap, layersMap } = get();
    const layer = layersMap[currentLayer];
    const layerFrames = [...layer.frames];
    const newFrame = getEmptyFrame();
    layerFrames.splice(currentIndex + 1, 0, newFrame.id);
    set({
      framesMap: { ...framesMap, [newFrame.id]: newFrame },
      layersMap: { ...layersMap, [layer.id]: { ...layer, frames: [...layerFrames] } },
      currentFrame: newFrame.id,
      currentLayer: layer.id,
      currentIndex: currentIndex + 1,
      longest: Math.max(longest, layerFrames.length),
    });
  },

  duplicateFrame: () => {
    const { longest, currentLayer, currentIndex, currentFrame, framesMap, layersMap } = get();
    const layer = layersMap[currentLayer];
    if (!layer) return;
    const source = currentFrame ? framesMap[currentFrame] : null;
    const newFrame = {
      ...getEmptyFrame(),
      dataUrl: source?.dataUrl || '',
      json: source?.json || null,
    };
    const layerFrames = [...layer.frames];
    layerFrames.splice(currentIndex + 1, 0, newFrame.id);
    set({
      framesMap: { ...framesMap, [newFrame.id]: newFrame },
      layersMap: { ...layersMap, [layer.id]: { ...layer, frames: layerFrames } },
      currentFrame: newFrame.id,
      currentIndex: currentIndex + 1,
      longest: Math.max(longest, layerFrames.length),
    });
  },

  clearFrame: () => {
    const { framesMap, currentFrame } = get();
    const frame = framesMap[currentFrame];
    if (!frame) return;
    set({ framesMap: { ...framesMap, [currentFrame]: { ...frame, dataUrl: '' } } });
  },

  deleteFrame: () => {
    const { currentFrame, currentIndex, framesMap, layersMap, currentLayer, layers } = get();
    const layerFrames = [...layersMap[currentLayer].frames];
    layerFrames[currentIndex] = undefined;
    if (currentFrame) {
      const newFrames = { ...framesMap };
      delete newFrames[currentFrame];
      set({
        framesMap: newFrames,
        layersMap: { ...layersMap, [currentLayer]: { ...layersMap[currentLayer], frames: layerFrames } },
        currentFrame: null,
      });
    } else {
      layerFrames.splice(currentIndex, 1);
      let length = 0;
      layers.forEach((layerId) => {
        const len = layerId === currentLayer ? layerFrames.length : layersMap[layerId].frames.length;
        length = Math.max(length, len);
      });
      set({
        layersMap: { ...layersMap, [currentLayer]: { ...layersMap[currentLayer], frames: layerFrames } },
        currentFrame: layerFrames[currentIndex]?.id || null,
        longest: length,
      });
    }
  },

  nextFrame: () => {
    const { longest, currentIndex, currentLayer, layersMap } = get();
    let nextIndex = currentIndex + 1;
    if (nextIndex >= longest) nextIndex = 0;
    const newFrame = layersMap[currentLayer]?.frames?.[nextIndex];
    set({ currentIndex: nextIndex, currentFrame: newFrame });
  },

  prevFrame: () => {
    const { longest, currentIndex, currentLayer, layersMap } = get();
    const prevIndex = currentIndex <= 0 ? Math.max(0, longest - 1) : currentIndex - 1;
    const newFrame = layersMap[currentLayer]?.frames?.[prevIndex];
    set({ currentIndex: prevIndex, currentFrame: newFrame });
  },

  createFrameRange: ({ layerIndex, frameIndex }) => {
    const { currentIndex, currentLayer, layers } = get();
    const currentLayerIndex = layers.findIndex((id) => id === currentLayer);
    set({
      framesRange: {
        from: {
          frameIndex: Math.min(frameIndex, currentIndex),
          layerIndex: Math.min(layerIndex, currentLayerIndex),
        },
        to: {
          frameIndex: Math.max(frameIndex, currentIndex),
          layerIndex: Math.max(layerIndex, currentLayerIndex),
        },
      },
    });
  },

  // ===== Layer actions =====
  addLayer: () => {
    const { framesMap, layersMap, layers } = get();
    const newFrame = getEmptyFrame();
    const newLayer = getEmptyLayer([newFrame.id]);
    set({
      framesMap: { ...framesMap, [newFrame.id]: newFrame },
      layersMap: { ...layersMap, [newLayer.id]: newLayer },
      layers: [...layers, newLayer.id],
    });
  },

  deleteLayer: (id) => {
    const { layersMap, layers } = get();
    const newLayersMap = { ...layersMap };
    const newLayers = [...layers];
    const index = newLayers.indexOf(id);
    if (index > -1) newLayers.splice(index, 1);
    delete newLayersMap[id];
    set({
      layersMap: newLayersMap,
      currentLayer: newLayers[index],
      layers: newLayers,
    });
  },

  // ===== Hydrate from draft =====
  hydrate: (state) => {
    if (!state || !state.layers || !state.layersMap) return;
    const firstLayerId = state.layers[0];
    const firstLayer = state.layersMap[firstLayerId];
    const firstFrameId = firstLayer?.frames?.[0] || null;
    let maxLen = 0;
    state.layers.forEach((key) => {
      const len = state.layersMap[key]?.frames?.length || 0;
      if (len > maxLen) maxLen = len;
    });
    set({
      framesMap: state.framesMap || {},
      layersMap: state.layersMap,
      layers: state.layers,
      longest: maxLen || 1,
      currentLayer: firstLayerId,
      currentFrame: firstFrameId,
      currentIndex: 0,
    });
  },

  // ===== History =====
  commit: () => {
    const s = get();
    const snap = captureSnapshot(s);
    set({
      history: {
        past: [...s.history.past, snap].slice(-MAX_HISTORY),
        future: [],
      },
    });
  },

  undo: () => {
    const s = get();
    if (s.history.past.length === 0) return;
    const prev = s.history.past[s.history.past.length - 1];
    const current = captureSnapshot(s);
    set({
      ...applySnapshot(prev),
      history: {
        past: s.history.past.slice(0, -1),
        future: [current, ...s.history.future].slice(0, MAX_HISTORY),
      },
    });
  },

  redo: () => {
    const s = get();
    if (s.history.future.length === 0) return;
    const next = s.history.future[0];
    const current = captureSnapshot(s);
    set({
      ...applySnapshot(next),
      history: {
        past: [...s.history.past, current].slice(-MAX_HISTORY),
        future: s.history.future.slice(1),
      },
    });
  },

  resetHistory: () => set({ history: { past: [], future: [] } }),
}));

// Derived selector: compose current frame slice across visible layers.
// Returns a new array on every call — callers must use `shallow` equality.
export const selectSlice = (s) => {
  const { currentIndex, layers, framesMap, layersMap } = s;
  const slice = layers
    .map((key) => {
      const layer = layersMap[key];
      if (!layer) return null;
      const frameId = layer.frames?.[currentIndex];
      const frame = frameId ? framesMap[frameId] : null;
      return {
        id: key,
        dataUrl: frame?.dataUrl,
        json: frame?.json,
        isVisible: layer.isVisible,
      };
    })
    .filter(Boolean);
  return slice.reverse();
};

export { shallow };
