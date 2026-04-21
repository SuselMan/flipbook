import Dexie from 'dexie';

export const db = new Dexie('flipbook');

db.version(1).stores({
    drafts: '&id, updatedAt, name, forkedFrom',
});
