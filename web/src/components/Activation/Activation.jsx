import React, {useEffect, useState} from 'react';
import {useStyles} from './Activation.styles';
import {ReactComponent as PreloaderIcon} from "../../shared/icons/preloader.svg";
import {useParams, useHistory } from 'react-router-dom';
import {activate} from '../../modules/API/API';

const Activation = () => {
    const classes = useStyles();
    const params = useParams();
    const history = useHistory();
    const [isLoading, setIsLoading] = useState(true);
    const [isFailed, setIsFailed] = useState(false);
    const [error, setError] = useState(null);
    const [timer, setTimer] = useState(5);
    console.log('params');

    useEffect(() => {
        activate(params.id)
            .then(() => {
                setIsLoading(false);
                setIsFailed(false);
                let timerCopy = 5;
                const t = setInterval(() => {
                    timerCopy = timerCopy - 1;
                    setTimer(timerCopy);
                    if(timerCopy === 0) {
                        clearInterval(t);
                        history.push('/login');
                    }
                }   , 1000);
            })
            .catch((error) => {
                console.log('error', {...error});
                setIsLoading(false);
                setIsFailed(true);
                setError(error.message);
            })
    }, []);

    return <div className={classes.activationContainer}>
        {isLoading && <>Activation... <PreloaderIcon className={classes.preloader}/></>}
        {!isLoading && !isFailed && <><h1>Activation complete!</h1><div className={classes.subline}>You will be redirected in {timer} seconds.</div></>}
        {!isLoading && isFailed && <><h1 className={classes.error}>Activation failed!</h1><div className={classes.error}>{error}</div></>}
    </div>
}

export default Activation;