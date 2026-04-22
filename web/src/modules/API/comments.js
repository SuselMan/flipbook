import { apiFetch, apiFetchAuth } from './API';

export const fetchComments = (projectId, { cursor, limit = 20 } = {}) => {
    const qs = new URLSearchParams();
    if (cursor) qs.set('cursor', cursor);
    if (limit) qs.set('limit', String(limit));
    return apiFetch(`/api/projects/${projectId}/comments?${qs.toString()}`);
};

export const fetchReplies = (commentId, { cursor, limit = 20 } = {}) => {
    const qs = new URLSearchParams();
    if (cursor) qs.set('cursor', cursor);
    if (limit) qs.set('limit', String(limit));
    return apiFetch(`/api/comments/${commentId}/replies?${qs.toString()}`);
};

export const postComment = (projectId, { text, parentId } = {}) =>
    apiFetchAuth(`/api/projects/${projectId}/comments`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text, parentId: parentId || null }),
    });

export const deleteComment = (id) =>
    apiFetchAuth(`/api/comments/${id}`, { method: 'DELETE' });

export const hideComment = (id) =>
    apiFetchAuth(`/api/comments/${id}/hide`, { method: 'POST' });

export const reportComment = (id, reason = '') =>
    apiFetchAuth(`/api/comments/${id}/report`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reason }),
    });
