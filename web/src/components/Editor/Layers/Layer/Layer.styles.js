import { createUseStyles } from 'react-jss';
import {LAYERS_HEIGHT, FRAME_WIDTH, FRAME_HEIGHT, FRAME_MARGIN } from '../../Editor.styles';

export const useStyles = createUseStyles(theme => {
    return {
        layerTools: {
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0 20px',
            //filter: 'brightness(1.02)',
            background: theme.colors.mainBackground,
            position: 'absolute',
            width: 300,
            left:0,
            zIndex: 100,
        },
        frames: {
            display: 'flex',
            padding: 2,
            flexShrink: 0,
            outline: 'none'
        },
        first: {
            marginTop: 14 + FRAME_MARGIN/2,
        }
    }
});