export const signIn = async (data) => {
    const res = fetch('/api/v1/users/signup', { method: 'POST', body: JSON.stringify(data) });
    console.log('res', res);
}

export const signUp = async (data) => {
    const res = await fetch('/api/v1/users/signup', {
        method: 'POST',
        headers: new Headers({'content-type': 'application/json'}),
        body: JSON.stringify(data)
    });
    const json = await res.json();
    if (res.status === 201) {
        console.log('User created', json);
        return json;
    } else {
        throw new Error(json?.message || 'Unknown error');
    }
}
