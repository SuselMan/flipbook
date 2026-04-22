import { useEffect, useRef } from 'react';
import { useEditorStore } from '../stores/editorStore';
import { saveDraft } from '../modules/db/drafts';

const DEBOUNCE_MS = 30000;

export const useDraftAutosave = (draftId) => {
    const layers = useEditorStore((s) => s.layers);
    const layersM = useEditorStore((s) => s.layersMap);
    const framesM = useEditorStore((s) => s.framesMap);

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
