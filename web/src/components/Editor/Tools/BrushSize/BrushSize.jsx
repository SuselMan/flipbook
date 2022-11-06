import React from 'react';
import { useStyles } from './BrushSize.styles';
import clsx from 'clsx';
import RoundButton from "../../../shared/RoundButton/RoundButton";
import {getString, stringNames} from "../../../../configs/strings";
import {ReactComponent as BrushSizeIcon} from "../../../../shared/icons/brush-size.svg";
import Tooltip from '@mui/material/Tooltip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Slider from '@mui/material/Slider';

const BrushSize = ({ brushSize, setIsBrushTooltipOpen, currentColor, isBrushTooltipOpen, setBrush }) => {
    const classes = useStyles();
    return <Tooltip
        title={
            <div className={classes.container}>
                <div className={classes.brushContainer}>
                    <div
                        className={classes.brush}
                        style={{backgroundColor: currentColor, width: `${brushSize}px`, height: `${brushSize}px`}}>

                    </div>
                </div>
                <div className={classes.brushSize}>{brushSize}</div>
                <Slider
                    aria-label="Volume"
                    value={brushSize}
                    color="secondary"
                    min={1}
                    max={100}
                    onChange={(e, newValue) => setBrush(Number(newValue))} />
            </div>
        }
        PopperProps={{
            disablePortal: true,
            modifiers: [
                {
                    name: "offset",
                    options: {
                        offset: [0, -30],
                    }
                },
            ],
        }}
        componentsProps={{
            tooltip: {
                sx: {
                    padding: '0px',
                    borderRadius: '8px',
                },
            },
        }}
        placement="left"
        open={isBrushTooltipOpen}
        disableFocusListener
        disableHoverListener
        disableTouchListener
    >
        <div>
            <ClickAwayListener onClickAway={() => setIsBrushTooltipOpen(false)}>
                <div>
                    <RoundButton
                        title={getString(stringNames.brushSizeToolTitle)}
                        iconColor={currentColor}
                        onClick={() => {
                            console.log(isBrushTooltipOpen);
                            setIsBrushTooltipOpen(!isBrushTooltipOpen);
                        }}
                        isPressed={isBrushTooltipOpen}
                    >
                        <BrushSizeIcon/>
                    </RoundButton>
                </div>
            </ClickAwayListener>
        </div>
    </Tooltip>
};

export default BrushSize;