import React from 'react';
import clsx from 'clsx'
import {useStyles} from './Modal.styles';
import {ReactComponent as CloseIcon} from '../../../shared/icons/closeIcon.svg';

const Modal = (props) => {
    const classes = useStyles();
    const {children, isOpen, close, title} = props;
    return <div className={clsx(classes.modalOverlay, {[classes.hidden]: !isOpen})}>
        <div className={classes.modalBlock}>
            <div className={classes.modalHeader}>
                <div className={classes.title}>{title}</div>
                <button className={classes.closeButton} onClick={close}>
                    <CloseIcon/>
                </button>
            </div>
            <div className={classes.modalBody}>
                {children}
            </div>
        </div>
    </div>
};

export default Modal;