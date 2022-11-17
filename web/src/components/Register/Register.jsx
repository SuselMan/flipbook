import React, { useState } from 'react';
import { useStyles } from './Register.styles';
import TextField from '@mui/material/TextField';
import clsx from 'clsx';
import { signUp } from '../../modules/API/API';

const Register = () => {
    const classes = useStyles();
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');
    const [isValid, setIsValid] = useState(true);

    const register = () => {
        return signUp({userName, password});
    }

    const onUserNameChanged = (event) => {
        setUserName(event.target.value)
    }

    const onPasswordChanged = (event) => {
        setPassword(event.target.value)
    }

    const onPasswordRepeatChanged = (event) => {
        setPasswordRepeat(event.target.value)
    }

    return <div className={classes.container}>
        <TextField
            id="User name"
            label="Username"
            variant="standard"
            value={userName}
            onChange={onUserNameChanged}
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
            className={clsx(classes.loginButton)}
            onClick={register}
        >
            Sign up
        </button>
    </div>
}

export default Register;