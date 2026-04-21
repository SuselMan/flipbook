import * as uuid from 'uuid';
import { db } from './db';

const CURRENT_DRAFT_KEY = 'flipbook.currentDraftId';

export const getCurrentDraftId = () => localStorage.getItem(CURRENT_DRAFT_KEY);

export const setCurrentDraftId = (id) => {
    if (id) localStorage.setItem(CURRENT_DRAFT_KEY, id);
    else localStorage.removeItem(CURRENT_DRAFT_KEY);
};

export const createDraft = async (overrides = {}) => {
    const now = Date.now();
    const draft = {
        id: uuid.v4(),
        name: '',
        description: '',
        state: null,
        forkedFrom: null,
        publishedAs: null,
        createdAt: now,
        updatedAt: now,
        ...overrides,
    };
    await db.drafts.put(draft);
    return draft;
};

export const getDraft = (id) => db.drafts.get(id);

export const saveDraft = async (id, patch) => {
    await db.drafts.update(id, { ...patch, updatedAt: Date.now() });
};

export const deleteDraft = (id) => db.drafts.delete(id);

export const listDrafts = () =>
    db.drafts.orderBy('updatedAt').reverse().toArray();

export const ensureDraft = async () => {
    const id = getCurrentDraftId();
    if (id) {
        const existing = await getDraft(id);
        if (existing) return existing;
    }
    const draft = await createDraft();
    setCurrentDraftId(draft.id);
    return draft;
};
