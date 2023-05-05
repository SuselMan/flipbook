import React, {useEffect, useRef, useState} from 'react';
import useStateRef from 'react-usestateref';
//import { useStyles } from './DragIcon.styles';

const DraggableItem = ({children, isFloat, itemWidth, itemHeight}) => {
    //const classes = useStyles();
    const [mousePosition, setMousePosition, mousePosRef] = useStateRef([0,0]);
    const [startPosition, setStartPosition, startPosRef] = useStateRef([0,0]);
    const itemRef = useRef();

    useEffect(() => {
        setStartPosition(null)
    }, [isFloat]);
    //const [speed, setSpeed] = useState(0);
    useEffect(() => {
        document.body.addEventListener('mousemove', (e) => {
            let startItem = itemRef.current.getBoundingClientRect();
            if(!startPosRef.current) {
                setStartPosition([startItem.left - e.clientX, startItem.top- e.clientY]);
            }
            // setSpeed(mousePosition[1] - e.clientY)
            setMousePosition([e.clientX + startPosRef.current[0], e.clientY + + startPosRef.current[1]]);
        });
        document.body.addEventListener('touchmove', (e) => {
            if(!startPosition) {

            }
            //setSpeed(mousePosition[1] - e.touches[0].clientY)
            setMousePosition([e.touches[0].clientX, e.touches[0].clientY]);
        });
    }, []);
    return <>
        <div
            style={{
                position: isFloat ? 'fixed' : undefined,
                left: isFloat? mousePosition[0] : undefined,
                top: isFloat? mousePosition[1] : undefined,
                zIndex: isFloat ? 100000 : undefined,
                boxShadow: isFloat ? `10px 10px 60px 0px rgba(0,0,0,0.1)`: undefined,
              //  transform: `rotate(${speed}deg)`
            }}
        >
            {children}
        </div>
        <div ref={itemRef} style={{
                    width: `${itemWidth}px`,
                    height: `${itemHeight}px`,
                    display: isFloat ? undefined : 'none',
                    backgroundColor: 'grey',
                }
            }
        />
    </>
};

export default DraggableItem;