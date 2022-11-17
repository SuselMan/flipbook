import React, { useState } from 'react';
import { useStyles } from './Login.styles';
import TextField from '@mui/material/TextField';
import clsx from 'clsx';
import { signIn } from '../../modules/API/API';

const Login = () => {
    const classes = useStyles();

    return <div className={classes.container}>
        <TextField
            id="Username"
            label="Username"
            variant="standard"
            // value={name}
            // onChange={handleChange}
        />
        <TextField
            id="Password1"
            type="password"
            label="Password"
            variant="standard"
        />
        <button className={clsx(classes.loginButton)}>
            Sign in
        </button>
    </div>
}

export default Login;