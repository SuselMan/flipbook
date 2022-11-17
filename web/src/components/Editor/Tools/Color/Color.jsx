import React from 'react';
import { useStyles } from './Color.styles';
import RoundButton from '../../../shared/RoundButton/RoundButton';
import {getString, stringNames} from '../../../../configs/strings';
import {ReactComponent as ColorIcon} from '../../../../shared/icons/color.svg';
import Tooltip from '@mui/material/Tooltip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { BlockPicker } from 'react-color';

const Color = ({ currentColor, pickColor, isTooltipOpen, setIsTooltipOpen }) => {
    const classes = useStyles();
    return <Tooltip
        title={
            <div className={classes.colorPicker}>
                <BlockPicker
                    triangle={'hide'}
                    color={ currentColor }
                    onChangeComplete={ pickColor }
                />
            </div>
        }
        PopperProps={{
            disablePortal: true,
            modifiers: [
                {
                    name: "offset",
                    options: {
                        offset: [-20, -30],
                    }
                },
            ],
        }}
        componentsProps={{
            tooltip: {
                sx: {
                    bgcolor: currentColor,
                    '& .MuiTooltip-arrow': {
                        color: currentColor,
                    },
                    padding: '0px',
                    borderRadius: '8px'
                },
            },
        }}
        placement="left"
        open={isTooltipOpen}
        disableFocusListener
        disableHoverListener
        disableTouchListener
    >
        <div>
            <ClickAwayListener onClickAway={() => setIsTooltipOpen(false)}>
                <div>
                    <RoundButton
                        title={getString(stringNames.paletteToolTitle)}
                        onClick={() => setIsTooltipOpen(!isTooltipOpen)}
                        isPressed={isTooltipOpen}
                        borderColor={currentColor}
                    >
                        <ColorIcon/>
                    </RoundButton>
                </div>
            </ClickAwayListener>
        </div>
    </Tooltip>
};

export default Color;