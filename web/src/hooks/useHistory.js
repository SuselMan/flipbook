import { useEditorStore, shallow } from '../stores/editorStore';

export const useCommit = () => useEditorStore((s) => s.commit);
export const useUndo = () => useEditorStore((s) => s.undo);
export const useRedo = () => useEditorStore((s) => s.redo);
export const useResetHistory = () => useEditorStore((s) => s.resetHistory);

export const useHistoryState = () =>
    useEditorStore(
        (s) => ({ canUndo: s.history.past.length > 0, canRedo: s.history.future.length > 0 }),
        shallow,
    );
