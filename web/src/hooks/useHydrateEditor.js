import { useEditorStore } from '../stores/editorStore';

export const useHydrateEditor = () => useEditorStore((s) => s.hydrate);
