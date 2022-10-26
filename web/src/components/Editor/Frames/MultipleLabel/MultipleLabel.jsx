import React, {memo, useEffect, useState} from 'react';
import {useStyles, borderSize} from './MultipleLabel.styles';
import clsx from 'clsx';
import {FRAME_WIDTH, FRAME_MARGIN} from "../Frame.constants";

const SLICK_AREA = 20;

const MultipleLabel = (props) => {
    const {
        item,
        count = 0,
        setCount,
        direction,
        framesLength = 1,
    } = props;

    const classes = useStyles();
    const marginParameter = direction === 'left' ? 'marginLeft' : 'marginRight';
    let [isDraggable, setIsDraggable] = useState(false);
    const [slickStep, setSlickStep] = useState(count);
    const [marginValue, setMarginValue] = useState(0);

    useEffect(() => {
        setPositionByStep(count);
    }, [count]);

    useEffect(() => {
        const moveHandler = (e) => onMouseMove(e)
        const mouseUpHandler = () => {
            setPositionByStep(slickStep);
            setCount(slickStep)
        }
        document.body.addEventListener('pointermove', moveHandler);
        document.body.addEventListener('pointerup', mouseUpHandler);
        return () => {
            document.body.removeEventListener('pointermove', moveHandler);
            document.body.removeEventListener('pointerup', mouseUpHandler);
        }
    });

    const setPositionByStep = (step) => {
        let stepToSet = step;
        if(direction === 'left' && step < -item.index) {
            stepToSet = -item.index;
        }

        if (direction === 'right' && step > framesLength - 1 - item.index) {
            stepToSet = framesLength - 1 - item.index;
        }


        setPosition(stepToSet * (FRAME_WIDTH + (FRAME_MARGIN * 2)))
        setIsDraggable(false);
    }

    const setPosition = (position) => {
        let x = position;
        if(direction === 'right') {
            x *= -1;
            x -= 5
        } else {
            x -= 5;
        }
        setMarginValue(x);
    }
    
    const onMouseMove = (evt) => {
        // TODO: refactor;
        if(isDraggable) {
            const elm = document.querySelector(`#multiple${direction}`);
            const rect = elm.parentElement.parentElement.getBoundingClientRect();
            let x = evt.clientX - rect[direction];
            if((direction === 'right' && x < 0) || (direction === 'left' && x > 0)) {
                x = 0;
            }

            let closestSlickStep = Math.round(x / (FRAME_WIDTH + (FRAME_MARGIN * 2)));

            if (direction === 'left' && closestSlickStep < -item.index) {
                x = -item.index * (FRAME_WIDTH + (FRAME_MARGIN * 2));
                closestSlickStep = Math.round(x / (FRAME_WIDTH + (FRAME_MARGIN * 2)));
            }

            if (direction === 'right' && closestSlickStep > framesLength - 1 - item.index) {
                x = (framesLength - 1 - item.index) * (FRAME_WIDTH + (FRAME_MARGIN * 2));
                closestSlickStep = Math.round(x / (FRAME_WIDTH + (FRAME_MARGIN * 2)));
            }

            const distanceToClosestStep = Math.max(closestSlickStep * (FRAME_WIDTH + (FRAME_MARGIN * 2)),x) - Math.min(closestSlickStep * (FRAME_WIDTH + (FRAME_MARGIN * 2)),x);
            if (distanceToClosestStep < SLICK_AREA) {
                x = closestSlickStep * (FRAME_WIDTH + (FRAME_MARGIN * 2));
                if(closestSlickStep !== slickStep) {
                    setSlickStep(closestSlickStep);
                }
            }
            setPosition(x);
        }
    };
    return <div>
        <button
            id={`multiple${direction}`}
            className={clsx(classes.multipleLabel, { [classes.rightLabel]: direction === 'right' })}
            onMouseDown={() => setIsDraggable(true)}
            onMouseMove={onMouseMove}
            style={{
                [marginParameter]: `${marginValue}px`
            }}
        />
        <div
            className={clsx(classes.veil, { [classes.veilRight]: direction === 'right' })}
            style={{
                left: direction === 'right' ? `calc(50% + ${borderSize / 2}px)` : `${marginValue}px`,
                width: `${Math.abs(marginValue) + FRAME_WIDTH/2 - (borderSize / 2)}px`,
            }}
        />
    </div>
}

export default MultipleLabel;