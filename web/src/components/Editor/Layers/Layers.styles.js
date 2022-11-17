import { createUseStyles } from 'react-jss';
import {LAYERS_HEIGHT, LAYERS_TOOLS_WIDTH} from '../Editor.styles';
import {FRAME_HEIGHT, FRAME_MARGIN, FRAME_WIDTH} from "../Frames/Frame.constants";

export const useStyles = createUseStyles(theme => {
    return {
        layersPanel: {
            position: 'absolute',
            bottom: 0,
            height: LAYERS_HEIGHT,
            width: '100%',
            border: `2px solid ${theme.colors.paper}`,
            outline: `2px solid ${theme.colors.dropShadowDark}`
        },
        layersTools: {
            display: 'flex',
            flexDirection: 'column',
            width: LAYERS_TOOLS_WIDTH,
            height: '100%',
            borderRight: `1px solid ${theme.colors.dropShadowDark}`,
        },
        layersContainer: {
            position: 'absolute',
            left: LAYERS_TOOLS_WIDTH + 1,
            height: LAYERS_HEIGHT,
            bottom: 0,
            overflow: 'auto',
            width: `calc(100% - ${LAYERS_TOOLS_WIDTH + 1}px)`,
            '&::-webkit-scrollbar': {
                height: '10px',
                width: '10px',
                backgroundColor: theme.colors.scrollbarBackground
            },
            '&::-webkit-scrollbar-thumb': {
                backgroundColor: theme.colors.scrollBarThumbColor
            },
            display: 'flex',
            flexDirection: 'column'
        },
        index: {
            height: '100%',
            position: 'absolute',
            left: 0,
            top: 0,
            backgroundColor: theme.colors.dropShadowLight,
            opacity: 0.2,
            width: FRAME_WIDTH + (FRAME_MARGIN * 2) + FRAME_MARGIN,
        }
    }
});