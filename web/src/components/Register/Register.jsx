import React, { useState } from 'react';
import { useStyles } from './Register.styles';
import TextField from '@mui/material/TextField';
import clsx from 'clsx';
import { signUp } from '../../modules/API/API';
import {ReactComponent as GoogleIcon} from '../../shared/icons/google.svg';

const Register = () => {
    const classes = useStyles();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');
    const [isValid, setIsValid] = useState(true);

    const register = () => {
        // TODO: validate email and password
        return signUp({email, password});
    }

    const registerWithGoogle = () => {
        window.location.href = '/api/auth/google';
    }

    const onEmailChanged = (event) => {
        setEmail(event.target.value)
    }

    const onPasswordChanged = (event) => {
        setPassword(event.target.value)
    }

    const onPasswordRepeatChanged = (event) => {
        setPasswordRepeat(event.target.value)
    }

    return <div className={classes.container}>
        <TextField
            id="Email"
            label="Email"
            variant="standard"
            value={email}
            onChange={onEmailChanged}
        />
        <TextField
            id="Password1"
            type="password"
            label="Password"
            variant="standard"
            value={password}
            onChange={onPasswordChanged}
        />
        <TextField
            id="PasswordRepeat"
            type="password"
            label="Repeat password"
            variant="standard"
            value={passwordRepeat}
            onChange={onPasswordRepeatChanged}
        />
        <button
            className={clsx(classes.loginButton, classes.first)}
            onClick={register}
        >
            Sign up
        </button>
        <div className={classes.or}>
            or
        </div>
        <button
            className={clsx(classes.loginButton, classes.googleButton)}
            onClick={registerWithGoogle}
        >
            <GoogleIcon className={clsx(classes.icon)}/>
        </button>
    </div>
}

export default Register;