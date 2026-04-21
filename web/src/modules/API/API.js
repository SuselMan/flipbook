const TOKEN_KEY = 'token';

const stripBearer = (t) => (t && t.startsWith('Bearer ') ? t.slice(7) : t);

export const getToken = () => stripBearer(localStorage.getItem(TOKEN_KEY));
export const setToken = (token) => {
    if (token) localStorage.setItem(TOKEN_KEY, stripBearer(token));
    else localStorage.removeItem(TOKEN_KEY);
};
export const logout = () => {
    setToken(null);
    window.location.assign('/');
};
export const isAuthenticated = () => !!getToken();

const withAuth = (init = {}) => {
    const token = getToken();
    const headers = new Headers(init.headers || {});
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return { ...init, headers };
};

const readBody = async (res) => {
    const text = await res.text().catch(() => '');
    if (!text) return { json: null, text: '' };
    try { return { json: JSON.parse(text), text }; }
    catch { return { json: null, text }; }
};

const handleResponse = async (res) => {
    const { json, text } = await readBody(res);
    if (!res.ok) {
        const msg = json?.error || json?.message || text || `HTTP ${res.status}`;
        const err = new Error(msg);
        err.status = res.status;
        err.body = json;
        throw err;
    }
    return json;
};

export const apiFetch = async (url, init = {}) => {
    let res;
    try {
        res = await fetch(url, init);
    } catch (err) {
        throw new Error(`Network error: ${err.message}`);
    }
    return handleResponse(res);
};

export const apiFetchAuth = async (url, init = {}) => {
    let res;
    try {
        res = await fetch(url, withAuth(init));
    } catch (err) {
        throw new Error(`Network error: ${err.message}`);
    }
    return handleResponse(res);
};

export const signIn = async (data) => {
    const json = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (json?.token) setToken(json.token);
    return json;
};

export const signUp = async (data) => {
    const json = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (json?.token) setToken(json.token);
    return json;
};

export const fetchMe = () => apiFetchAuth('/api/user').then((r) => r?.user || null);

export const activate = async (id) => {
    const json = await apiFetch(`/api/auth/activate/${id}`);
    if (json?.jwt) setToken(json.jwt);
    return json;
};

export const publishProject = async ({
    sourceBlob,
    previewBlob,
    thumbnailBlob,
    meta,
    onProgress,
}) => {
    const form = new FormData();
    form.append('source', sourceBlob, 'source.zip');
    form.append('preview', previewBlob, 'preview.webp');
    form.append('thumbnail', thumbnailBlob, 'thumb.webp');
    Object.entries(meta || {}).forEach(([k, v]) => {
        if (v != null) form.append(k, String(v));
    });

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/projects/publish');
        const token = getToken();
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total);
        };
        xhr.onload = () => {
            let body = null;
            try { body = xhr.responseText ? JSON.parse(xhr.responseText) : null; } catch {}
            if (xhr.status >= 200 && xhr.status < 300) resolve(body);
            else reject(new Error(body?.error || `HTTP ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(form);
    });
};
