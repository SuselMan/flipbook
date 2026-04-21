import React from 'react';
import clsx from 'clsx'
import {useStyles} from './BaseButton.styles';

const BaseButton = (props) => {
    const classes = useStyles();
    const {children, variant = 'primary', onClick, title, size = 'default'} = props;

    return <button className={clsx(classes.baseButton, classes[variant], classes[size])} onClick={onClick} title={title}>
        {children}
    </button>
};

export default BaseButton;