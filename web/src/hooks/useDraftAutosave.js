import { useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { layersAtom, layersMap, framesMap } from '../components/Editor/Editor.state';
import { saveDraft } from '../modules/db/drafts';

const DEBOUNCE_MS = 800;

export const useDraftAutosave = (draftId) => {
    const layers = useRecoilValue(layersAtom);
    const layersM = useRecoilValue(layersMap);
    const framesM = useRecoilValue(framesMap);

    const timerRef = useRef();
    const firstRun = useRef(true);

    useEffect(() => {
        if (!draftId) return;
        if (firstRun.current) {
            firstRun.current = false;
            return;
        }
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            saveDraft(draftId, {
                state: { layers, layersMap: layersM, framesMap: framesM },
            }).catch((err) => {
                console.error('Draft autosave failed', err);
            });
        }, DEBOUNCE_MS);
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [draftId, layers, layersM, framesM]);
};
