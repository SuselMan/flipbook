import React, {memo, useEffect, useState} from 'react';
import {useStyles, borderSize} from './MultipleLabel.styles';
import clsx from 'clsx';
import {FRAME_HEIGHT, FRAME_WIDTH, FRAME_MARGIN, LAYERS_TOOLS_WIDTH} from "../../Editor.styles";

const SLICK_AREA = 10;

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
    }, [count, item.index]);

    useEffect(() => {
        const moveHandler = (e) => onMouseMove(e);
        const mouseUpHandler = () => {
            setPositionByStep(slickStep);
            setCount(slickStep)
        };
        document.body.addEventListener('pointermove', moveHandler);
        document.body.addEventListener('touchmove', moveHandler);
        document.body.addEventListener('pointerup', mouseUpHandler);
        document.body.addEventListener('touchend', mouseUpHandler);
        return () => {
            document.body.removeEventListener('pointermove', moveHandler);
            document.body.removeEventListener('touchmove', moveHandler);
            document.body.removeEventListener('touchend', mouseUpHandler);
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
        console.log(position);
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
            const rect = elm.getBoundingClientRect();
            const clientX = evt.touches?.[0] ? evt.touches?.[0].clientX : evt.clientX;
            let x = clientX - rect[direction];
            console.log('evt', evt);
            if((direction === 'right' && x < 0) || (direction === 'left' && x > 0)) {
                x = 0;
            }

            let closestSlickStep = Math.round(x / (FRAME_WIDTH + (FRAME_MARGIN * 2)));
            console.log('closestSlickStep', closestSlickStep);
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
    return <div
        className={classes.container}
        id={`multiple${direction}`}
        style={{
            width: FRAME_WIDTH,
            left: `${FRAME_MARGIN + item.index * (FRAME_WIDTH + 2*FRAME_MARGIN) + LAYERS_TOOLS_WIDTH}px`
        }}
    >
        <button
            className={clsx(classes.multipleLabel, { [classes.rightLabel]: direction === 'right' })}
           // onMouseDown={() => setIsDraggable(true)}
            onPointerDown={() => setIsDraggable(true)}
            //onMouseMove={onMouseMove}
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