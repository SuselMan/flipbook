import { createUseStyles } from 'react-jss';
import {LAYERS_HEIGHT, LAYERS_TOOLS_WIDTH, FRAME_WIDTH, FRAME_HEIGHT, FRAME_MARGIN } from '../../Editor.styles';

export const useStyles = createUseStyles(theme => {
    return {
        layerTools: {
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0 20px',
            //filter: 'brightness(1.02)',
            //background: theme.colors.mainBackground,
        },
        frames: {
            display: 'flex',
            padding: 2,
            flexShrink: 0,
        },
    }
});