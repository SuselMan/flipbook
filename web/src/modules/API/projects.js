import { apiFetch, apiFetchAuth, getToken } from './API';

export const fetchProject = (id) =>
    apiFetchAuth(`/api/projects/${id}`).then((r) => r.project);

export const fetchProjectSource = async (id) => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const res = await fetch(`/api/projects/${id}/source`, { headers });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
    }
    return res.blob();
};

export const fetchFeed = ({ sort = 'new', scope = 'global', cursor, limit = 24 } = {}) => {
    const qs = new URLSearchParams();
    qs.set('sort', sort);
    qs.set('scope', scope);
    if (cursor) qs.set('cursor', cursor);
    if (limit) qs.set('limit', String(limit));
    return apiFetchAuth(`/api/feed?${qs.toString()}`);
};

export const checkUsername = (u) =>
    apiFetch(`/api/users/check-username?u=${encodeURIComponent(u)}`);

export const fetchUserProfile = (username) =>
    apiFetch(`/api/users/${encodeURIComponent(username)}`).then((r) => r.user);

export const fetchUserProjects = (username, { cursor, limit = 24 } = {}) => {
    const qs = new URLSearchParams();
    if (cursor) qs.set('cursor', cursor);
    if (limit) qs.set('limit', String(limit));
    return apiFetch(`/api/users/${encodeURIComponent(username)}/projects?${qs.toString()}`);
};

export const updateMe = (patch) =>
    apiFetchAuth('/api/me', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(patch),
    });

export const uploadAvatar = async (blob) => {
    const form = new FormData();
    form.append('avatar', blob, 'avatar.webp');
    const token = getToken();
    const res = await fetch('/api/me/avatar', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form,
    });
    if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(t || `HTTP ${res.status}`);
    }
    return res.json();
};

export const deleteAvatar = () =>
    apiFetchAuth('/api/me/avatar', { method: 'DELETE' });

export const fetchMyProjects = ({ cursor, limit = 24 } = {}) => {
    const qs = new URLSearchParams();
    if (cursor) qs.set('cursor', cursor);
    if (limit) qs.set('limit', String(limit));
    return apiFetchAuth(`/api/me/projects?${qs.toString()}`);
};

export const likeProject = (id) =>
    apiFetchAuth(`/api/projects/${id}/like`, { method: 'POST' });

export const unlikeProject = (id) =>
    apiFetchAuth(`/api/projects/${id}/like`, { method: 'DELETE' });

export const forkProject = (id) =>
    apiFetchAuth(`/api/projects/${id}/fork`, { method: 'POST' });
