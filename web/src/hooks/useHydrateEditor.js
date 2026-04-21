import { unstable_batchedUpdates } from 'react-dom';
import { useSetRecoilState } from 'recoil';
import {
    layersAtom,
    layersMap,
    framesMap,
    currentFrameAtom,
    currentLayerAtom,
    currentIndexAtom,
    longestLayer,
} from '../components/Editor/Editor.state';

export const useHydrateEditor = () => {
    const setLayers = useSetRecoilState(layersAtom);
    const setLayersMap = useSetRecoilState(layersMap);
    const setFramesMap = useSetRecoilState(framesMap);
    const setCurrentFrame = useSetRecoilState(currentFrameAtom);
    const setCurrentLayer = useSetRecoilState(currentLayerAtom);
    const setCurrentIndex = useSetRecoilState(currentIndexAtom);
    const setLongest = useSetRecoilState(longestLayer);

    return (state) => {
        if (!state || !state.layers || !state.layersMap) return;
        const firstLayerId = state.layers[0];
        const firstLayer = state.layersMap[firstLayerId];
        const firstFrameId = firstLayer?.frames?.[0] || null;

        let maxLen = 0;
        state.layers.forEach((key) => {
            const len = state.layersMap[key]?.frames?.length || 0;
            if (len > maxLen) maxLen = len;
        });

        unstable_batchedUpdates(() => {
            setFramesMap(state.framesMap || {});
            setLayersMap(state.layersMap);
            setLayers(state.layers);
            setLongest(maxLen || 1);
            setCurrentLayer(firstLayerId);
            setCurrentFrame(firstFrameId);
            setCurrentIndex(0);
        });
    };
};
