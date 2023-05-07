import React, { useState } from 'react';
import { useStyles } from './Feed.styles';
import TextField from '@mui/material/TextField';
import clsx from 'clsx';
import { signIn } from '../../modules/API/API';
import {ReactComponent as GoogleIcon} from "../../shared/icons/google.svg";

const Feed = () => {
    const classes = useStyles();
    const loginWithGoogle = () => {
        window.location.href = '/api/auth/google';
    }

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
        <button className={clsx(classes.loginButton, classes.first)}>
            Sign in
        </button>

        <div className={classes.or}>
            or
        </div>
        <button
            className={clsx(classes.loginButton, classes.googleButton)}
            onClick={loginWithGoogle}
        >
            <GoogleIcon className={clsx(classes.icon)}/>
        </button>
    </div>
}

export default Feed;