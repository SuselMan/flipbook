import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStyles } from './Login.styles';
import TextField from '@mui/material/TextField';
import clsx from 'clsx';
import { signIn } from '../../modules/API/API';
import { ReactComponent as GoogleIcon } from '../../shared/icons/google.svg';

const Login = () => {
    const classes = useStyles();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);

    const handleSignIn = async () => {
        console.log('[Login] handleSignIn called');
        if (busy) return;
        setError(null);
        if (!email || !password) {
            setError('Enter email and password');
            return;
        }
        setBusy(true);
        try {
            const res = await signIn({ email, password });
            console.log('[Login] signIn success', res);
            window.location.assign('/');
        } catch (err) {
            console.error('[Login] signIn failed', err);
            setError(err.message || 'Login failed');
            setBusy(false);
        }
    };

    const loginWithGoogle = () => {
        window.location.assign('/api/auth/google');
    };

    const onKeyDown = (e) => {
        if (e.key === 'Enter') handleSignIn();
    };

    return (
        <div className={classes.container}>
            {error && (
                <div style={{
                    background: '#ff4e4e',
                    color: '#fff',
                    padding: '12px 16px',
                    borderRadius: 8,
                    textAlign: 'center',
                    width: '300px',
                    fontSize: 16,
                }}>{error}</div>
            )}
            <TextField
                id="email"
                label="Email"
                type="email"
                variant="standard"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={onKeyDown}
            />
            <TextField
                id="password"
                type="password"
                label="Password"
                variant="standard"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={onKeyDown}
            />
            <button
                type="button"
                className={clsx(classes.loginButton, classes.first)}
                onClick={handleSignIn}
                disabled={busy}
            >
                {busy ? 'Signing in…' : 'Sign in'}
            </button>

            <div className={classes.or}>or</div>
            <button
                type="button"
                className={clsx(classes.loginButton, classes.googleButton)}
                onClick={loginWithGoogle}
            >
                <GoogleIcon className={clsx(classes.icon)}/>
            </button>
            <div style={{ textAlign: 'center', fontSize: 14 }}>
                No account? <Link to="/register">Sign up</Link>
            </div>
        </div>
    );
};

export default Login;
