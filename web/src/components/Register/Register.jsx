import React from 'react';
import { useStyles } from './Register.styles';
import TextField from '@mui/material/TextField';
import clsx from 'clsx';

const Register = () => {
    const classes = useStyles();

    return <div className={classes.container}>
        <TextField
            id="User name"
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
        <TextField
            id="Password2"
            type="password"
            label="Repeat password"
            variant="standard"
        />
        <button className={clsx(classes.loginButton)}>
            Sign up
        </button>
    </div>
}

export default Register;