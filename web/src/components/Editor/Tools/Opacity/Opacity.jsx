import React from 'react';
import { useStyles } from './Opacity.styles';
import Tooltip from '@mui/material/Tooltip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import clsx from 'clsx';
import RoundButton from "../../../shared/RoundButton/RoundButton";
import {getString, stringNames} from "../../../../configs/strings";
import {ReactComponent as OpacityIcon} from "../../../../shared/icons/opacity.svg";
import Slider from '@mui/material/Slider';

const Opacity = ({ opacity, setOpacityValue, isOpacityTooltipOpen, setIsOpacityTooltipOpen, currentColor }) => {
    const classes = useStyles();
    return <Tooltip
        title={
            <div className={classes.container}>
                <div className={classes.brushContainer}>
                    <div
                        className={classes.brush}
                        style={{backgroundColor: currentColor, width: `${100}px`, height: `${100}px`, opacity}}>

                    </div>
                </div>
                <div className={classes.brushSize}>{opacity}</div>
                <Slider
                    aria-label="Opacity"
                    value={opacity * 100}
                    color="secondary"
                    min={0}
                    max={100}
                    onChange={(e, newValue) => setOpacityValue(Number(newValue) / 100)} />
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
        open={isOpacityTooltipOpen}
        disableFocusListener
        disableHoverListener
        disableTouchListener
    >
        <div>
            <ClickAwayListener onClickAway={() => setIsOpacityTooltipOpen(false)}>
                <div>
                    <RoundButton
                        title={getString(stringNames.opacityToolTitle)}
                        onClick={() => {
                            setIsOpacityTooltipOpen(!isOpacityTooltipOpen);
                        }}
                        isPressed={isOpacityTooltipOpen}
                    >
                        <OpacityIcon/>
                    </RoundButton>
                </div>
            </ClickAwayListener>
        </div>
    </Tooltip>
};

export default Opacity;