import { createUseStyles } from 'react-jss';
import {LAYERS_HEIGHT} from '../Editor.styles';
import {FRAME_HEIGHT, FRAME_MARGIN, FRAME_WIDTH, LAYERS_TOOLS_WIDTH} from "../Editor.styles";

const TIMELINE_HEIGHT = 15;

export const useStyles = createUseStyles(theme => {
    return {
        layersPanel: {
            position: 'absolute',
            bottom: 0,
            height: LAYERS_HEIGHT,
            width: '100%',
            border: `2px solid ${theme.colors.paper}`,
            outline: `2px solid ${theme.colors.dropShadowDark}`,
            backgroundColor: theme.colors.mainBackground,
        },
        // layersTools: {
        //     display: 'flex',
        //     flexDirection: 'column',
        //     width: LAYERS_TOOLS_WIDTH,
        //     height: '100%',
        //     borderRight: `1px solid ${theme.colors.dropShadowDark}`,
        // },
        layersContainer: {
            //scrollSnapType: 'both proximity',
            position: 'absolute',
            left: 1,
            height: LAYERS_HEIGHT,
            bottom: 0,
            overflow: 'auto',
            width: `100%`,
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
        },
        timeline: {
            display: 'flex',
            height: TIMELINE_HEIGHT,
            position: 'fixed',
            backgroundColor: theme.colors.mainBackground,
            zIndex: 1,
            overflow: 'hidden',
            marginLeft: LAYERS_TOOLS_WIDTH,
        },
        frameIndex: {
            margin: `0 ${FRAME_MARGIN}px 0 0`,
            minWidth: FRAME_WIDTH,
            borderLeft: `1px solid ${theme.colors.mainText}`,
            paddingLeft: FRAME_MARGIN - 1,
            fontSize: 11,
            '&:nth-child(10n)': {
                borderLeft: `2px solid ${theme.colors.mainText}`,
                fontWeight: 'bold'
            }
        },
        selectedIndex: {
            borderLeft: `1px solid ${theme.colors.buttonBackground}`,
            color: theme.colors.buttonBackground,
            '&:nth-child(10n)': {
                borderLeft: `2px solid ${theme.colors.buttonBackground}`,
                fontWeight: 'bold'
            }
        }
    }
});