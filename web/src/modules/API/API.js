export const signIn = async (data) => {
    const res = fetch('/api/v1/users/signup', { method: 'POST', body: JSON.stringify(data) });
}

export const authFetch = (url, data) => {
    const authorization = localStorage.getItem('token');
    const newData = {...data};
    newData.headers = newData.headers || new Headers();
    if(newData.headers.append) {
        newData.headers.append('Authorization', authorization);
    } else {
        newData.headers['Authorization'] = authorization;
    }

    return fetch(url, data)
}


export const activate = async (data) => {
    const res = await fetch(`/api/auth/activate/${data}`);
    const json = await res.json();
    console.log('json', json);
    if (res.status === 200) {
        if(json?.jwt) localStorage.setItem('token', json.jwt);
        return json;
    } else {
        throw new Error(json?.error || 'Unknown error');
    }
}

export const addProject = async (data) => {
    const formData = new FormData();
    formData.append('file', data);
    const res = await authFetch('/api/projects/add', {
        method: 'POST',
        headers: new Headers({'Accept': '*/*'}),
        body: formData
    });
    const json = await res.json();
    if (res.status === 200) {
        return json;
    } else {
        throw new Error(json?.message || 'Unknown error');
    }
}

export const signUp = async (data) => {
    const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: new Headers({'content-type': 'application/json'}),
        body: JSON.stringify(data)
    });
    const json = await res.json();
    if (res.status === 201) {
        return json;
    } else {
        throw new Error(json?.message || 'Unknown error');
    }
}

