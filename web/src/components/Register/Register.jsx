import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStyles } from './Register.styles';
import TextField from '@mui/material/TextField';
import clsx from 'clsx';
import { signUp } from '../../modules/API/API';
import { checkUsername } from '../../modules/API/projects';
import CountrySelect from '../shared/CountrySelect/CountrySelect';
import { detectCountryFromTimezone } from '../../modules/countries';
import { ReactComponent as GoogleIcon } from '../../shared/icons/google.svg';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-z0-9_-]{3,32}$/;

const randomUsername = () => {
    const hex = Math.random().toString(16).slice(2, 10);
    return `user_${hex}`;
};

const Register = () => {
    const classes = useStyles();
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState(() => randomUsername());
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');
    const [country, setCountry] = useState(() => detectCountryFromTimezone());
    const [usernameStatus, setUsernameStatus] = useState({ state: 'idle' });
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);
    const checkTimer = useRef();

    useEffect(() => {
        if (checkTimer.current) clearTimeout(checkTimer.current);
        if (!username) { setUsernameStatus({ state: 'idle' }); return; }
        if (!USERNAME_RE.test(username)) {
            setUsernameStatus({ state: 'invalid', message: '3-32 chars: a-z, 0-9, _, -' });
            return;
        }
        setUsernameStatus({ state: 'checking' });
        checkTimer.current = setTimeout(async () => {
            try {
                const r = await checkUsername(username);
                if (r?.available) setUsernameStatus({ state: 'available' });
                else if (r?.reason === 'reserved') setUsernameStatus({ state: 'invalid', message: 'Reserved' });
                else setUsernameStatus({ state: 'taken', message: 'Already taken' });
            } catch (e) {
                setUsernameStatus({ state: 'idle' });
            }
        }, 400);
        return () => clearTimeout(checkTimer.current);
    }, [username]);

    const validate = () => {
        if (!EMAIL_RE.test(email)) return 'Enter a valid email';
        if (!USERNAME_RE.test(username)) return 'Username must be 3-32 chars (a-z, 0-9, _, -)';
        if (usernameStatus.state === 'taken') return 'Username already taken';
        if (usernameStatus.state === 'invalid') return usernameStatus.message || 'Invalid username';
        if (password.length < 6) return 'Password must be at least 6 characters';
        if (password !== passwordRepeat) return 'Passwords do not match';
        return null;
    };

    const handleSignUp = async () => {
        if (busy) return;
        const v = validate();
        if (v) { setError(v); return; }
        setError(null);
        setBusy(true);
        try {
            await signUp({ email, username, password, country });
            window.location.assign('/');
        } catch (err) {
            console.error('[Register] signUp failed', err);
            setError(err.message || 'Registration failed');
            setBusy(false);
        }
    };

    const registerWithGoogle = () => {
        window.location.assign('/api/auth/google');
    };

    const onKeyDown = (e) => {
        if (e.key === 'Enter') handleSignUp();
    };

    const usernameHelper = (() => {
        switch (usernameStatus.state) {
            case 'checking': return 'Checking…';
            case 'available': return '✓ Available';
            case 'taken': return '✗ Already taken';
            case 'invalid': return `✗ ${usernameStatus.message}`;
            default: return ' ';
        }
    })();

    return (
        <div className={classes.container}>
            {error && (
                <div style={{
                    background: '#ff4e4e', color: '#fff', padding: '12px 16px',
                    borderRadius: 8, textAlign: 'center', width: '300px', fontSize: 16,
                }}>{error}</div>
            )}
            <TextField
                id="Email"
                label="Email"
                type="email"
                variant="standard"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={onKeyDown}
            />
            <TextField
                id="Username"
                label="Username"
                variant="standard"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                onKeyDown={onKeyDown}
                helperText={usernameHelper}
                error={usernameStatus.state === 'taken' || usernameStatus.state === 'invalid'}
            />
            <TextField
                id="Password1"
                type="password"
                label="Password"
                variant="standard"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={onKeyDown}
            />
            <TextField
                id="PasswordRepeat"
                type="password"
                label="Repeat password"
                variant="standard"
                value={passwordRepeat}
                onChange={(e) => setPasswordRepeat(e.target.value)}
                onKeyDown={onKeyDown}
            />
            <CountrySelect
                value={country}
                onChange={setCountry}
                label="Country (optional)"
                helperText="Used for the local feed"
            />
            <button
                type="button"
                className={clsx(classes.loginButton, classes.first)}
                onClick={handleSignUp}
                disabled={busy}
            >
                {busy ? 'Creating…' : 'Sign up'}
            </button>
            <div className={classes.or}>or</div>
            <button
                type="button"
                className={clsx(classes.loginButton, classes.googleButton)}
                onClick={registerWithGoogle}
            >
                <GoogleIcon className={clsx(classes.icon)}/>
            </button>
            <div style={{ textAlign: 'center', fontSize: 14 }}>
                Already have an account? <Link to="/login">Sign in</Link>
            </div>
        </div>
    );
};

export default Register;
