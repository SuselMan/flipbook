import { useRecoilCallback, useRecoilValue } from 'recoil';
import { unstable_batchedUpdates } from 'react-dom';
import {
    layersAtom,
    layersMap,
    framesMap,
    currentFrameAtom,
    currentLayerAtom,
    currentIndexAtom,
    longestLayer,
    historyAtom,
} from '../components/Editor/Editor.state';

const MAX_HISTORY = 30;

const captureState = async (snapshot) => ({
    layers: await snapshot.getPromise(layersAtom),
    layersMap: await snapshot.getPromise(layersMap),
    framesMap: await snapshot.getPromise(framesMap),
    currentFrame: await snapshot.getPromise(currentFrameAtom),
    currentLayer: await snapshot.getPromise(currentLayerAtom),
    currentIndex: await snapshot.getPromise(currentIndexAtom),
    longest: await snapshot.getPromise(longestLayer),
});

const restoreState = (set, state) => {
    unstable_batchedUpdates(() => {
        set(framesMap, state.framesMap);
        set(layersMap, state.layersMap);
        set(layersAtom, state.layers);
        set(longestLayer, state.longest);
        set(currentLayerAtom, state.currentLayer);
        set(currentFrameAtom, state.currentFrame);
        set(currentIndexAtom, state.currentIndex);
    });
};

export const useCommit = () =>
    useRecoilCallback(({ snapshot, set }) => async () => {
        const current = await captureState(snapshot);
        set(historyAtom, (h) => ({
            past: [...h.past, current].slice(-MAX_HISTORY),
            future: [],
        }));
    }, []);

export const useUndo = () =>
    useRecoilCallback(({ snapshot, set }) => async () => {
        const h = await snapshot.getPromise(historyAtom);
        if (h.past.length === 0) return;
        const prev = h.past[h.past.length - 1];
        const current = await captureState(snapshot);
        restoreState(set, prev);
        set(historyAtom, {
            past: h.past.slice(0, -1),
            future: [current, ...h.future].slice(0, MAX_HISTORY),
        });
    }, []);

export const useRedo = () =>
    useRecoilCallback(({ snapshot, set }) => async () => {
        const h = await snapshot.getPromise(historyAtom);
        if (h.future.length === 0) return;
        const next = h.future[0];
        const current = await captureState(snapshot);
        restoreState(set, next);
        set(historyAtom, {
            past: [...h.past, current].slice(-MAX_HISTORY),
            future: h.future.slice(1),
        });
    }, []);

export const useResetHistory = () =>
    useRecoilCallback(({ set }) => () => {
        set(historyAtom, { past: [], future: [] });
    }, []);

export const useHistoryState = () => {
    const h = useRecoilValue(historyAtom);
    return { canUndo: h.past.length > 0, canRedo: h.future.length > 0 };
};
